import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { VideoEntity } from "./video.entity";

@Injectable()
export class VideoService {
    constructor(
        @InjectRepository(VideoEntity)
        private videoRepository: Repository<VideoEntity>
      ) {}

    findAll(): Promise<VideoEntity[]> {
        return this.videoRepository.find()
    }

    save(videoEntity :VideoEntity): Promise<VideoEntity> {
        return this.videoRepository.save(videoEntity)
    }

    findVideo(params): Promise<VideoEntity> {
        return this.videoRepository.findOneOrFail({name: params.videoName})
    }
}