import { Controller, Get, Post, UseInterceptors ,UploadedFile, HttpException, Req, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { BaseResponse } from './response';
import { VideoService } from './video/video.service';
import { VideoModule } from './video/video.module';
import { VideoEntity } from './video/video.entity';
import { resolve } from 'path/posix';
import { rejects } from 'assert';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly videoService: VideoService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file): Promise<Object> {
    return new Promise((resolve, reject) => {
      this.appService.upload(file).then(result => {
        this.videoService.save(result).then(result => {
          var baseResponse = new BaseResponse()
          baseResponse.code = 200
          baseResponse.data = result
          baseResponse.message = 'success'
          resolve(baseResponse)
        }).catch(error => {
          console.log(error)
          var baseResponse = new BaseResponse()
          baseResponse.code = 500
          baseResponse.data = error
          baseResponse.message = 'fail'
          reject(baseResponse)
        })
      }).catch(error => {
        console.log(error)
        var baseResponse = new BaseResponse()
        baseResponse.code = 500
        baseResponse.data = error
        baseResponse.message = 'fail'
        reject(baseResponse)
      })
    })
  }

  @Post('/createGif')
  createGif(@Body() request): Promise<BaseResponse> {
    var baseResponse: BaseResponse = new BaseResponse()
    console.log(request)
    return new Promise((resolve, rejects) => {
      this.videoService.findVideo(request).then(video => {
        this.appService.createGif(video).then(body => {
          baseResponse.code = 200
          baseResponse.message = 'success'
          baseResponse.data = body
          resolve(baseResponse)
        }).catch(err => {
          console.log(err)
          baseResponse.code = 500
          baseResponse.message = 'fail'
          baseResponse.data = err
          rejects(baseResponse)
        })
      }).catch(err => {
        console.log(err)
        baseResponse.code = 500
        baseResponse.message = 'fail'
        baseResponse.data = err
        rejects(baseResponse)
      })
    })
  }
}
