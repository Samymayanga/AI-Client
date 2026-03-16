import { useEffect, useState } from "react";
import "./Community.css";
import Loading from "../loading/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImages,
  faUser,
  faHeart,
  faDownload,
  faEye,
  faClock,
  faPlusCircle,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

export default function Community() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const { axios } = useAppContext();

  const fetchImages = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/srg-ai/user/public-images");

      if (data.success) {
        // Ensure images is an array before setting
        setImages(Array.isArray(data.images) ? data.images : []);
      } else {
        toast.error(data.message || "Failed to load images");
        setImages([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error(error.response?.data?.message || error.message);
      setImages([]); // Always set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="community">
      {/* Simple Header */}
      <div className="community-header">
        <div>
          <h2 className="community-title">
            <FontAwesomeIcon icon={faImages} className="title-icon" />
            Community Gallery
          </h2>
          <p className="community-subtitle">
            Share and explore AI-generated images
          </p>
        </div>

        <button className="upload-btn">
          <FontAwesomeIcon icon={faUpload} />
          <span>Upload</span>
        </button>
      </div>

      {/* Image Grid or Empty State */}
      {images.length > 0 ? (
        <div className="image-grid">
          {images.map((item, index) => (
            <div
              key={item._id || index}
              className="image-card"
              onClick={() => setSelectedImage(item)}
            >
              <div className="image-wrapper">
                <img
                  src={item.imageUrl}
                  className="grid-image"
                  alt={`By ${item.userName}`}
                  loading="lazy"
                />
                <div className="image-overlay">
                  <button className="view-btn">
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                </div>
              </div>

              <div className="image-footer">
                <div className="user-line">
                  <div className="user-avatar">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                  <span className="user-name">
                    {item.userName || "Anonymous"}
                  </span>
                </div>

                <div className="image-meta">
                  <span className="meta-item">
                    <FontAwesomeIcon icon={faHeart} className="heart-icon" />
                    {item.likes || 0}
                  </span>
                  <span className="meta-item">
                    <FontAwesomeIcon icon={faClock} className="clock-icon" />
                    {item.createdAt
                      ? moment(item.createdAt).fromNow()
                      : "Recently"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-gallery">
          <FontAwesomeIcon icon={faImages} className="empty-icon" />
          <h3 className="empty-title">No images yet</h3>
          <p className="empty-text">
            Be the first to share your AI-generated images!
          </p>

          <div className="empty-actions">
            <button className="primary-btn">
              <FontAwesomeIcon icon={faPlusCircle} />
              Create Image
            </button>
            <button className="secondary-btn">
              <FontAwesomeIcon icon={faUpload} />
              Upload
            </button>
          </div>

          <div className="tips">
            <p className="tips-title">Quick tips:</p>
            <p>• Generate images using Image Mode in chat</p>
            <p>• Toggle "Publish to community" when creating</p>
            <p>• Share your best creations with others</p>
          </div>
        </div>
      )}

      {/* Simple Modal */}
      {selectedImage && (
        <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>

            <img
              src={selectedImage.imageUrl}
              className="modal-image"
              alt={`By ${selectedImage.userName}`}
            />

            <div className="modal-info">
              <div className="modal-user">
                <div className="modal-avatar">
                  <FontAwesomeIcon icon={faUser} />
                </div>
                <div>
                  <h4>{selectedImage.userName || "Anonymous"}</h4>
                  <span className="modal-time">
                    <FontAwesomeIcon icon={faClock} />
                    {selectedImage.createdAt
                      ? moment(selectedImage.createdAt).format("MMM Do, YYYY")
                      : "Recently"}
                  </span>
                </div>
              </div>

              <div className="modal-stats">
                <div>
                  <span className="stat-label">Views</span>
                  <span className="stat-value">{selectedImage.views || 0}</span>
                </div>
                <div>
                  <span className="stat-label">Likes</span>
                  <span className="stat-value">{selectedImage.likes || 0}</span>
                </div>
              </div>

              <div className="modal-actions">
                <button className="modal-like">
                  <FontAwesomeIcon icon={faHeart} />
                  Like
                </button>
                <button className="modal-download">
                  <FontAwesomeIcon icon={faDownload} />
                  Download
                </button>
              </div>

              {selectedImage.prompt && (
                <div className="modal-prompt">
                  <p className="prompt-label">Prompt</p>
                  <p className="prompt-text">"{selectedImage.prompt}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
