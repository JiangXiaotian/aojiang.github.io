const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 定义文件路径
const assetsDirPath = path.join(__dirname, '../source/assets');
const configFilePath = path.join(assetsDirPath, 'directories.json');

// 检查目录列表是否有变化
function directoriesChanged(oldDirs, newDirs) {
  if (oldDirs.length !== newDirs.length) return true;
  
  for (let i = 0; i < oldDirs.length; i++) {
    if (oldDirs[i] !== newDirs[i]) return true;
  }
  
  return false;
}

// 查找和更新目录配置
function updateDirectoryConfig(verbose = false) {
  try {
    // 确保assets目录存在
    if (!fs.existsSync(assetsDirPath)) {
      if (verbose) console.log('assets目录不存在，创建目录');
      fs.mkdirSync(assetsDirPath, { recursive: true });
    }
    
    // 读取assets下的一级子目录
    const dirents = fs.readdirSync(assetsDirPath, { withFileTypes: true });
    const directories = dirents
      .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
      .map(dirent => dirent.name)
      .sort();
    
    // 读取现有配置
    let configChanged = false;
    let existingConfig = { directories: [] };
    
    if (fs.existsSync(configFilePath)) {
      try {
        existingConfig = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
      } catch (e) {
        if (verbose) console.log('配置文件解析失败，将创建新配置');
        configChanged = true;
      }
    } else {
      if (verbose) console.log('配置文件不存在，将创建新配置');
      configChanged = true;
    }
    
    // 检查目录列表是否变化
    if (configChanged || directoriesChanged(existingConfig.directories || [], directories)) {
      if (verbose) console.log(`找到以下子目录: ${directories.join(', ')}`);
      
      // 准备配置数据
      const configData = {
        directories: directories,
        lastUpdated: new Date().toISOString()
      };
      
      // 写入配置文件
      fs.writeFileSync(configFilePath, JSON.stringify(configData, null, 2));
      if (verbose) console.log(`配置文件已更新: ${configFilePath}`);
      return directories;
    } else if (verbose) {
      console.log('目录结构未变化，保持配置不变');
    }
    
    return existingConfig.directories || [];
  } catch (error) {
    if (verbose) console.error('更新目录配置时出错:', error);
    return [];
  }
}

// 只在生成时执行一次目录更新，开发服务器模式下不执行
// 通过检测命令参数区分是开发模式还是生产模式
hexo.extend.filter.register('before_generate', function() {
  // 如果是server命令（开发模式）则不更新目录
  const isServerMode = process.argv.includes('server') || process.argv.includes('s');
  
  if (!isServerMode) {
    console.log('生产模式生成站点，更新目录配置...');
    updateDirectoryConfig(true);
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
    const directories = updateDirectoryConfig(true);
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