import sys
try:
    from moviepy.editor import VideoFileClip
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "moviepy==1.0.3", "decorator==4.4.2", "imageio==2.4.1", "imageio-ffmpeg==0.4.9"])
    from moviepy.editor import VideoFileClip

def reduce_video(input_file, output_file):
    try:
        print(f"Loading {input_file}...")
        clip = VideoFileClip(input_file)
        
        # Resize aggressively to save space (since it's a 180MB video)
        # e.g. reduce resolution to height 720 if it's 1080p, or just scale down to 50%
        print("Resizing video...")
        clip_resized = clip.resize(width=800)
        
        print(f"Writing to {output_file}...")
        clip_resized.write_videofile(output_file, bitrate="1000k", audio_bitrate="128k", preset="ultrafast", threads=4)
        
        clip.close()
        clip_resized.close()
        print(f"Successfully reduced {input_file} to {output_file}")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python reduce_video.py <input> <output>")
        sys.exit(1)
    reduce_video(sys.argv[1], sys.argv[2])
