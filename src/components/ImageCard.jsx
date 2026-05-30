import { useState } from 'react'

function ImageCard({ image, onDelete }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="image-card">
        <img 
          src={image.url} 
          alt={image.name}
          onClick={() => setIsModalOpen(true)}
        />
        <div className="info">
          <p className="filename">{image.name}</p>
          <p className="date">
            {new Date(image.created_at).toLocaleDateString()}
          </p>
          <button 
            className="delete-btn"
            onClick={() => onDelete(image.id, image.url)}
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Modal for enlarged view */}
      {isModalOpen && (
        <div className="modal" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content">
            <img src={image.url} alt={image.name} />
            <button className="close-btn">✖</button>
          </div>
        </div>
      )}
    </>
  )
}

export default ImageCard