import { useState } from 'react'
import { supabase } from '../config/supabase'

function ImageUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target.result)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage('Pumili muna ng picture!')
      return
    }

    setUploading(true)
    setMessage('')

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `uploads/${fileName}`

    try {
      const { error: uploadError } = await supabase.storage
        .from('product_images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('product_images')
        .getPublicUrl(filePath)

      const imageUrl = urlData.publicUrl

      const { error: dbError } = await supabase
        .from('images')
        .insert([{ name: file.name, url: imageUrl, size: file.size }])

      if (dbError) throw dbError

      setMessage('✓ Successful na-upload ang picture!')
      setFile(null)
      setPreview(null)
      document.getElementById('fileInput').value = ''
      if (onUploadSuccess) onUploadSuccess()
      
    } catch (error) {
      console.error('Error:', error)
      setMessage('❌ Error: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="image-upload">
      <h2>📸 Upload ng Picture</h2>
      <div className="upload-area">
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {preview && (
          <div className="preview">
            <h4>Preview:</h4>
            <img src={preview} alt="Preview" style={{maxWidth: '300px'}} />
          </div>
        )}
        <button onClick={handleUpload} disabled={uploading || !file}>
          {uploading ? '⏳ Nag-a-upload...' : '📤 I-upload ang Picture'}
        </button>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  )
}

export default ImageUpload