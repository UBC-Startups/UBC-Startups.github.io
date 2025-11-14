import React from "react";
import ImageGallery from "react-image-gallery";
import styled from "styled-components";
import "react-image-gallery/styles/css/image-gallery.css";

const GalleryContainer = styled.div`
    width: 80%;
    margin: -30px auto 0 auto;
  
    .image-gallery-slide img {
        border-radius: 40px;        
        object-fit: cover;          
        height: 320px;          
        width: 100%;
    }

    .image-gallery-thumbnails-container {
        margin-top: 20px;
        border-radius: 16px;
    }

    .image-gallery-thumbnails img {
        border-radius: 16px;
        object-fit: cover;
        height: 80px; 
    }
    
    .image-gallery-icon {
        color: #fff;
        filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.3));
        transition: all 0.3s ease; 
        
        padding: 10px;
        
        svg {
            height: 50px;
            width: 50px;
            transition: all 0.3s ease; 
        }
        
        &:hover {
            color: gray;
            
            svg {
                transform: scale(1.1);
            }
        }
    }
`;

const PhotoGallery = ({ images }) => {
  return (
    <GalleryContainer>
        <ImageGallery
            items={images}
            showPlayButton={false}
            showFullscreenButton={false}
            autoPlay={true}
            slideInterval={5000}
            showThumbnails={true}
            showBullets={true}
        />
    </GalleryContainer>
  );
};

export default PhotoGallery;

