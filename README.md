# LFS Baby 文件浏览器

这是一个基于Hexo的文件浏览应用，可以浏览存储在`source/assets`目录下的文件。

## 功能

- 浏览`source/assets`下的子目录
- 查看每个子目录中的图片、文本和视频文件
- 固定高度的文件预览，保持图片和视频的宽高比

## 目录结构

每个子目录下应包含以下文件夹：
- `images`：存放图片文件（命名格式：`1.png`, `2.png` 等）
- `texts`：存放文本文件（命名格式：`1.txt`, `2.txt` 等）
- `videos`：存放视频文件（命名格式：`1_*.mp4`, `2_*.mp4` 等）

## 访问方式

文件浏览器页面：[https://www.lfs.baby/fileviewer/](https://www.lfs.baby/fileviewer/)

## 开发

### 准备环境

```bash
# 安装依赖
npm install

# 启动开发服务器
hexo server
```

### 部署

```bash
# 清理旧的生成文件
hexo clean

# 生成静态文件
hexo generate

# 部署到GitHub
hexo deploy
```

### 注意事项

1. 首次部署后，需在GitHub仓库中设置自定义域名
2. 确保域名DNS已正确配置，将www.lfs.baby的CNAME记录指向jiangxiaotian.github.io
3. 如果需要在本地预览最终效果，请运行`hexo server -s`命令 