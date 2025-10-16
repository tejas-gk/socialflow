// File: src/components/ui/video.tsx
import React from 'react';

// Define the props the component will accept
interface VideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
}

const Video = React.forwardRef<HTMLVideoElement, VideoProps>(
  ({ src, ...props }, ref) => {
    return (
      <video ref={ref} {...props}>
        <source src={src} />
        Your browser does not support the video tag.
      </video>
    );
  }
);

Video.displayName = 'Video';

export { Video };