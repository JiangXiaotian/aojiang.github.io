#!/bin/bash

# 文件浏览器一键部署脚本
# 用法: ./deploy.sh [commit_message]

# 设置错误时停止执行
set -e

# 设置颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # 无颜色

# 默认提交消息
COMMIT_MSG=${1:-"更新文件浏览器"}

echo -e "${BLUE}===== 文件浏览器一键部署脚本 =====${NC}"

# 检查assets目录的子目录
echo -e "${YELLOW}检查资源目录...${NC}"
ASSETS_DIR="source/assets"

if [ ! -d "$ASSETS_DIR" ]; then
    echo -e "${RED}错误: $ASSETS_DIR 目录不存在${NC}"
    exit 1
fi

# 更新静态文件数据
echo -e "${YELLOW}更新文件浏览器的目录列表...${NC}"

# 获取目录列表
DIRECTORIES=$(find $ASSETS_DIR -maxdepth 1 -mindepth 1 -type d -not -path "*/\.*" -exec basename {} \;)

if [ -z "$DIRECTORIES" ]; then
    echo -e "${RED}警告: 在 $ASSETS_DIR 中未找到子目录${NC}"
fi

# 生成JavaScript目录数组代码
DIR_ARRAY="["
for DIR in $DIRECTORIES; do
    DIR_ARRAY+="'$DIR', "
done
DIR_ARRAY=${DIR_ARRAY%, }  # 移除最后的逗号和空格
DIR_ARRAY+="]"

# 生成静态文件数据对象
FILES_OBJECT="{"
for DIR in $DIRECTORIES; do
    # 确保目录结构存在
    for SUBDIR in "images" "texts" "videos"; do
        if [ ! -d "$ASSETS_DIR/$DIR/$SUBDIR" ]; then
            echo -e "${YELLOW}创建目录: $ASSETS_DIR/$DIR/$SUBDIR${NC}"
            mkdir -p "$ASSETS_DIR/$DIR/$SUBDIR"
        fi
    done
    
    # 获取文件列表
    IMAGES=$(find "$ASSETS_DIR/$DIR/images" -maxdepth 1 -type f -name "*.png" -exec basename {} \; | sort -V)
    TEXTS=$(find "$ASSETS_DIR/$DIR/texts" -maxdepth 1 -type f -name "*.txt" -exec basename {} \; | sort -V)
    VIDEOS=$(find "$ASSETS_DIR/$DIR/videos" -maxdepth 1 -type f -name "*.mp4" -exec basename {} \; | sort -V)
    
    # 添加到对象
    FILES_OBJECT+="'$DIR': { "
    FILES_OBJECT+="images: ["
    for IMG in $IMAGES; do
        FILES_OBJECT+="'$IMG', "
    done
    FILES_OBJECT=${FILES_OBJECT%, }  # 移除最后的逗号和空格
    FILES_OBJECT+="], "
    
    FILES_OBJECT+="texts: ["
    for TXT in $TEXTS; do
        FILES_OBJECT+="'$TXT', "
    done
    FILES_OBJECT=${FILES_OBJECT%, }  # 移除最后的逗号和空格
    FILES_OBJECT+="], "
    
    FILES_OBJECT+="videos: ["
    for VID in $VIDEOS; do
        FILES_OBJECT+="'$VID', "
    done
    FILES_OBJECT=${FILES_OBJECT%, }  # 移除最后的逗号和空格
    FILES_OBJECT+="] }, "
done
FILES_OBJECT=${FILES_OBJECT%, }  # 移除最后的逗号和空格
FILES_OBJECT+="}"

# 更新HTML文件中的静态数据
echo -e "${YELLOW}更新文件浏览器的静态数据...${NC}"
HTML_FILE="source/fileviewer/index.html"

# 创建临时文件
TMP_FILE=$(mktemp)

# 替换目录数组
sed -E "s/const staticDirectories = \[[^\]]*\];/const staticDirectories = $DIR_ARRAY;/" "$HTML_FILE" > "$TMP_FILE"
# 替换文件对象 (注意：这可能比较复杂，我们使用一个简化的方法)
perl -0777 -pe "s/const staticFiles = \{[^}]*\};/const staticFiles = $FILES_OBJECT;/s" "$TMP_FILE" > "$HTML_FILE"

# 清理
rm "$TMP_FILE"

echo -e "${GREEN}文件浏览器数据已更新${NC}"

# 构建和部署
echo -e "${YELLOW}清理旧的构建文件...${NC}"
hexo clean

echo -e "${YELLOW}生成静态文件...${NC}"
hexo generate

echo -e "${YELLOW}开始部署到GitHub...${NC}"
hexo deploy -m "$COMMIT_MSG"

echo -e "${GREEN}部署完成! 网站将在几分钟内更新${NC}"
echo -e "${BLUE}访问: https://www.lfs.baby/fileviewer/${NC}" 