import sys
import os
os.environ["IMAGEIO_FFMPEG_EXE"] = "/opt/homebrew/Cellar/ffmpeg/4.4.1_3/bin/ffmpeg"
print(len(sys.argv))

from moviepy.editor import VideoFileClip

video_name = sys.argv[1]
gif_name = sys.argv[2]

clip = VideoFileClip(video_name)
clip.write_gif(gif_name, fps=clip.fps)