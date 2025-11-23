import React, { useRef, useState, useCallback } from 'react';
import './PhotoCapture.css';

interface PhotoCaptureProps {
  onPhotoTaken: (photoBlob: Blob, photoUrl: string) => void;
  onError: (error: string) => void;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onPhotoTaken, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>('');

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      onError('Unable to access camera. Please ensure camera permissions are granted.');
    }
  }, [onError]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setPhotoUrl(url);
        setHasPhoto(true);
        onPhotoTaken(blob, url);
        stopCamera();
      }
    }, 'image/jpeg', 0.8);
  }, [onPhotoTaken, stopCamera]);

  const retakePhoto = useCallback(() => {
    if (photoUrl) {
      URL.revokeObjectURL(photoUrl);
    }
    setPhotoUrl('');
    setHasPhoto(false);
    startCamera();
  }, [photoUrl, startCamera]);

  React.useEffect(() => {
    return () => {
      stopCamera();
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [stopCamera, photoUrl]);

  return (
    <div className="photo-capture">
      <div className="camera-container">
        {!hasPhoto ? (
          <>
            <video
              ref={videoRef}
              className="camera-video"
              autoPlay
              playsInline
              muted
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </>
        ) : (
          <img
            src={photoUrl}
            alt="Captured"
            className="captured-photo"
          />
        )}
      </div>

      <div className="camera-controls">
        {!isStreaming && !hasPhoto && (
          <button
            onClick={startCamera}
            className="btn btn-primary camera-btn"
            type="button"
          >
            Start Camera
          </button>
        )}

        {isStreaming && !hasPhoto && (
          <div className="capture-controls">
            <button
              onClick={capturePhoto}
              className="btn btn-capture"
              type="button"
            >
              📷 Take Photo
            </button>
            <button
              onClick={stopCamera}
              className="btn btn-secondary"
              type="button"
            >
              Cancel
            </button>
          </div>
        )}

        {hasPhoto && (
          <div className="photo-controls">
            <button
              onClick={retakePhoto}
              className="btn btn-secondary"
              type="button"
            >
              Retake Photo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoCapture;