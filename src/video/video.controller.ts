import { Controller, Get } from "@nestjs/common";
import { VideoEntity } from "./video.entity";
import { VideoService } from "./video.service";

@Controller()
export class VideoController {
    constructor(private readonly vidoeService: VideoService) {

    }

    @Get('fuckyou')
    fuckyou() {
        var videoEntity: VideoEntity = new VideoEntity()
        videoEntity.name = "fuckyou"
        videoEntity.path = "fuckyou"
        this.vidoeService.save(videoEntity)
    }
}