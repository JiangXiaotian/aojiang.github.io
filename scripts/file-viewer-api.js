const fs = require('fs');
const path = require('path');

// 定义源目录路径
const SOURCE_DIR = path.join(process.cwd(), 'source/assets');

module.exports = function(hexo) {
  // 注册API路由
  hexo.extend.filter.register('server_middleware', function(app) {
    // 获取目录列表API
    app.use('/api/directories', function(req, res) {
      try {
        const sourceDir = SOURCE_DIR;
        
        // 确保目录存在
        if (!fs.existsSync(sourceDir)) {
          return res.json({
            success: false,
            message: '源目录不存在'
          });
        }
        
        // 读取目录
        const directories = fs.readdirSync(sourceDir, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
          .map(dirent => dirent.name);
        
        return res.json({
          success: true,
          directories: directories
        });
      } catch (error) {
        console.error('获取目录列表出错:', error);
        return res.json({
          success: false,
          message: '获取目录列表出错: ' + error.message
        });
      }
    });
    
    // 获取文件列表API
    app.use('/api/files', function(req, res) {
      try {
        const directory = req.query.directory;
        
        if (!directory) {
          return res.json({
            success: false,
            message: '缺少目录参数'
          });
        }
        
        // 安全检查，防止目录遍历攻击
        const sanitizedDir = path.normalize(directory).replace(/^(\.\.[\/\\])+/, '');
        const dirPath = path.join(SOURCE_DIR, sanitizedDir);
        
        // 确保目录存在
        if (!fs.existsSync(dirPath)) {
          return res.json({
            success: false,
            message: '目录不存在'
          });
        }
        
        // 获取图片、文本和视频文件
        const imagesPath = path.join(dirPath, 'images');
        const textsPath = path.join(dirPath, 'texts');
        const videosPath = path.join(dirPath, 'videos');
        
        const files = {
          images: [],
          texts: [],
          videos: []
        };
        
        // 读取图片文件
        if (fs.existsSync(imagesPath)) {
          files.images = fs.readdirSync(imagesPath)
            .filter(file => /^\d+\.png$/i.test(file))
            .sort((a, b) => {
              const numA = parseInt(a.split('.')[0]);
              const numB = parseInt(b.split('.')[0]);
              return numA - numB;
            });
        }
        
        // 读取文本文件
        if (fs.existsSync(textsPath)) {
          files.texts = fs.readdirSync(textsPath)
            .filter(file => /^\d+\.txt$/i.test(file))
            .sort((a, b) => {
              const numA = parseInt(a.split('.')[0]);
              const numB = parseInt(b.split('.')[0]);
              return numA - numB;
            });
        }
        
        // 读取视频文件
        if (fs.existsSync(videosPath)) {
          files.videos = fs.readdirSync(videosPath)
            .filter(file => /^\d+_.*\.mp4$/i.test(file))
            .sort((a, b) => {
              const numA = parseInt(a.split('_')[0]);
              const numB = parseInt(b.split('_')[0]);
              return numA - numB;
            });
        }
        
        return res.json({
          success: true,
          files: files
        });
      } catch (error) {
        console.error('获取文件列表出错:', error);
        return res.json({
          success: false,
          message: '获取文件列表出错: ' + error.message
        });
      }
    });
  });
}; 