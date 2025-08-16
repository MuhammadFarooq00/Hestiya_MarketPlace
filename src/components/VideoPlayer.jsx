import React from "react";

const VideoPlayer = ({ videoUrl }) => {
  return (
    <div className="video-player-container mt-4 mb-2">
      <video
        controls
        className="w-full rounded-lg"
        style={{ maxHeight: "400px" }}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;