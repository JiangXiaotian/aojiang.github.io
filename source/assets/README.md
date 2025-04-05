# 静态文件预览系统

这个目录包含用于文件预览系统的静态文件。文件按以下结构组织：

```
assets/
  ├── images/   # 图片文件 (.jpg, .jpeg, .png, .gif, .webp)
  ├── texts/    # 文本文件 (.txt, .md, .json, .csv)
  └── videos/   # 视频文件 (.mp4, .webm, .ogg, .mov)
```

## 使用方法

1. 将同名文件分别放入相应目录
   - 例如：`1.jpg` 放入 `images/`，`1.txt` 放入 `texts/`，`1.mp4` 放入 `videos/`

2. 更新文件列表
   - 编辑 `source/fileviewer/index.html` 文件
   - 找到 `fileNames` 数组
   - 添加新文件的基本名称（不带扩展名）
   
   ```javascript
   const fileNames = [
       '1', '2', '3', '4', '5', '新文件名'
   ];
   ```

3. 部署网站
   ```bash
   hexo clean && hexo deploy --generate
   ```

## 注意事项

- 图片、文本和视频文件应使用相同的基本文件名
- 支持的文件扩展名在页面中定义
- GitHub仓库有大小限制，大型视频文件可能需要其他解决方案
- 此系统完全静态，不需要服务器支持

## 访问

部署后，可以通过 https://www.lfs.baby/fileviewer/ 访问文件预览系统。 