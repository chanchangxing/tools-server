import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises'
import * as qiniu from 'qiniu'
import { BaseResponse } from './response';
import { VideoEntity } from './video/video.entity';
import { VideoService } from './video/video.service';
const process = require('child_process')

var base_absolute_path = '/Users/chenchanghang/Desktop/tools-server/'
var video2gif_absolute_path = '/Users/chenchanghang/Desktop/tools-server/script/video2gif.py'

@Injectable()
export class AppService {
  constructor(private readonly videoService: VideoService) {}
  
  getHello(): string {
    return 'Hello World!';
  }

  async createGif(video): Promise<object> {
    return new Promise((resolve, reject) => {
      console.log('video = '  + video)

      var video_absolute_path = video.path
      var gif_name = video.name.split('.')[0] + '.gif'
      var gif_absolute_path = base_absolute_path + gif_name
      var python_commond = 'python3 ' + video2gif_absolute_path + ' ' + video_absolute_path + ' ' + gif_absolute_path

      console.log('step 1 - 开始执行python脚本 \n python_commond = ' + python_commond)
      process.exec(python_commond, (error, stdout, stderr) => {
        console.log(stdout)
          if (error === null) {
            console.log('step 1 success - 执行python脚本成功')
            var config = new qiniu.conf.Config();
            var formUploader = new qiniu.form_up.FormUploader(config)
            var putExtra = new qiniu.form_up.PutExtra()
            var accessKey = '0WUiXs3hG4QWoW4uCJmE6DP3Xy3njm-mz4hChRx5';
            var secretKey = 'mmSjOKi7eDmeja9I2lAiZ2Iy-OSAoBBUIRx03lWC';
            var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
          
            var options = {
              scope: 'tools-server-test',
              expires: 7200
            };
            var putPolicy = new qiniu.rs.PutPolicy(options);
            var uploadToken = putPolicy.uploadToken(mac);
  
            console.log('step 2 - gif开始上传到七牛云')
            formUploader.putFile(uploadToken, gif_name, gif_absolute_path, putExtra, function(respErr,
              respBody, respInfo) {
              console.log('respErr = ' + respErr + ' respBody = ' + respBody + ' respInfo = ' + respInfo)
              if (respErr) {
                reject(respErr)
              }
              if (respInfo.statusCode == 200) {
                console.log(respErr)
                resolve({name: respBody.key, path: 'http://r4gbodcx3.hn-bkt.clouddn.com/' + respBody.key})
              } else {
                reject(respBody)
              }
            });
          } else {
            console.log(error)
            reject(error)
          }
        })
    })
  }

  // 用户上传的文件要把他保存到本地
  async upload(file): Promise<VideoEntity> {
    var video_name_array = file.originalname.split('.')
    var video_name = video_name_array[0] + '-' + new Date().getTime() + video_name_array[1]
    var video_absolute_path = base_absolute_path + file.originalname
    var gif_name = file.originalname.split('.')[0] + '.gif'
    var gif_absolute_path = base_absolute_path + gif_name
    

    // 创建response
    var response = new BaseResponse()

    return new Promise((resolve, reject) => {
      fs.writeFile(gif_absolute_path, file.buffer).then(() => {
        console.log('文件写入成功')

        console.log('step 2 - 开始上传视频至七牛云')

        var config = new qiniu.conf.Config()
        var formUploader = new qiniu.form_up.FormUploader(config)
        var putExtra = new qiniu.form_up.PutExtra()
        var accessKey = '0WUiXs3hG4QWoW4uCJmE6DP3Xy3njm-mz4hChRx5';
        var secretKey = 'mmSjOKi7eDmeja9I2lAiZ2Iy-OSAoBBUIRx03lWC';
        var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

        var options = {
          scope: 'tools-server-test',
          expires: 7200
        };

        var putPolicy = new qiniu.rs.PutPolicy(options);
        var uploadToken = putPolicy.uploadToken(mac);
        formUploader.putFile(
          uploadToken, 
          video_name, 
          video_absolute_path, 
          putExtra, 
          function (respErr,respBody, respInfo) {
            if(respErr) {
              response.code = 500
              response.data = respErr
              response.message = 'fail'
              reject(response)
              return
            }

            if (respInfo.statusCode == 200) {
              console.log(respErr)
              var videoEntity = new VideoEntity()
              videoEntity.name = video_name
              videoEntity.path = video_absolute_path
              videoEntity.remote_path = 'http://r4gbodcx3.hn-bkt.clouddn.com/' + encodeURI(video_name)
              resolve(videoEntity)
            } else {
              response.code = respInfo.statusCode
              response.message = 'fail'
              response.data = respBody
              reject(response)
            }
          })
      }).catch((error) => {
        response.code = 500
        response.message = 'fail'
        response.data = error
        reject(response)
      }) 
    })
  }
}
