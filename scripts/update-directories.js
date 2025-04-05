const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 定义文件路径
const assetsDirPath = path.join(__dirname, '../source/assets');
const configFilePath = path.join(assetsDirPath, 'directories.json');

// Hexo运行时会自动执行此方法
hexo.extend.filter.register('before_generate', function() {
  console.log('开始更新assets目录配置...');
  
  try {
    // 确保assets目录存在
    if (!fs.existsSync(assetsDirPath)) {
      console.log('assets目录不存在，创建目录');
      fs.mkdirSync(assetsDirPath, { recursive: true });
    }
    
    // 读取assets下的一级子目录
    const dirents = fs.readdirSync(assetsDirPath, { withFileTypes: true });
    const directories = dirents
      .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
      .map(dirent => dirent.name)
      .sort();
    
    console.log(`找到以下子目录: ${directories.join(', ')}`);
    
    // 准备配置数据
    const configData = {
      directories: directories,
      lastUpdated: new Date().toISOString()
    };
    
    // 写入配置文件
    fs.writeFileSync(configFilePath, JSON.stringify(configData, null, 2));
    console.log(`配置文件已更新: ${configFilePath}`);
    
  } catch (error) {
    console.error('更新目录配置时出错:', error);
  }
});

// 创建一个独立命令来清理、更新目录并生成站点
hexo.extend.console.register('rebuild', '清理缓存、更新目录并重新生成站点', {
  arguments: [],
  options: []
}, function(args) {
  try {
    // 执行清理
    console.log('开始清理...');
    execSync('hexo clean', { stdio: 'inherit' });
    
    // 更新目录配置
    console.log('更新目录配置...');
    const dirents = fs.readdirSync(assetsDirPath, { withFileTypes: true });
    const directories = dirents
      .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
      .map(dirent => dirent.name)
      .sort();
    
    const configData = {
      directories: directories,
      lastUpdated: new Date().toISOString()
    };
    
    fs.writeFileSync(configFilePath, JSON.stringify(configData, null, 2));
    console.log(`找到并更新了 ${directories.length} 个子目录`);
    
    // 重新生成站点
    console.log('开始生成站点...');
    execSync('hexo generate', { stdio: 'inherit' });
    
    console.log('站点重建完成！');
  } catch (error) {
    console.error('站点重建过程中出错:', error);
    process.exit(1);
  }
}); 