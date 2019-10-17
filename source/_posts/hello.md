---
title: 第二篇
---

# nginx设置代理，把nuxt项目放到服务器上运行的步骤

第一步、在本地 npm run build,会在.nuxt文件夹下生成dist文件;

第二步、把本地文件的.nuxt,static,package.json,nuxt.config.js,这四个文件夹放到服务器目录文件下，四个文件放到里面;

第三步、安装依赖，npm install;

第四步、npm start 此时运行的是 http://localhost:9000;

第五步、在nginx上面设置一下配置：proxy_pass http://localhost:9000;同理如果你有后台的话，也是这样的操作。

## 然后你就可以访问这个地址啦~