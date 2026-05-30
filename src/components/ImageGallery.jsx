import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

function ImageGallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

  const loadImages = async () => {
    console.log("Loading images...")
    setLoading(true)
    
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading images:', error)
    } else {
      console.log('Images loaded:', data)
      setImages(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadImages()
  }, [])

  if (loading) {
    return (
      <div className="gallery">
        <h2>🖼️ Gallery ng mga Larawan</h2>
        <p>⏳ Naglo-load ng mga larawan...</p>
      </div>
    )
  }

  return (
    <div className="gallery">
      <h2>🖼️ Gallery ng mga Larawan</h2>
      
      {images.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
          📭 Wala pang naka-upload na picture. Mag-upload na sa taas!
        </p>
      ) : (
        <div className="images-grid">
          {images.map((image) => (
            <div key={image.id} className="image-card">
              <img 
                src={image.url} 
                alt={image.name}
                onError={(e) => {
                  console.error('Image failed to load:', image.url)
                  e.target.src = 'https://via.placeholder.com/300?text=Image+Not+Found'
                }}
              />
              <div className="info">
                <p>📷 {image.name}</p>
                <p style={{ fontSize: '12px', color: '#999' }}>
                  {new Date(image.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageGallery