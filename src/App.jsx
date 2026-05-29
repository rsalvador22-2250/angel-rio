import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useGoogleLogin } from '@react-oauth/google'
import axios from 'axios'

// Supabase connection
const supabaseUrl = 'https://exnqeehprojsztisilrn.supabase.co'
const supabaseAnonKey = 'sb_publishable_IHLqi9GtKPK0-h31l1X_nw_KBaHUC8X'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Your Google Drive Folder ID
const DRIVE_FOLDER_ID = '1YymETCvIJN1vA_Hvg8uDo4Rv8Np7N-8g'

function App() {
  // Auth states
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMode, setAuthMode] = useState('login')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // Image states
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [savingToDrive, setSavingToDrive] = useState(false)
  const [accessToken, setAccessToken] = useState(null)

  // Google Login
  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setAccessToken(tokenResponse.access_token)
      setMessage('✅ Google Drive connected! You can now save images.')
      setTimeout(() => setMessage(''), 3000)
    },
    onError: () => {
      setMessage('❌ Google login failed. Please try again.')
      setTimeout(() => setMessage(''), 3000)
    },
    scope: 'https://www.googleapis.com/auth/drive.file'
  })

  // Check auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load images when logged in
  useEffect(() => {
    if (session) {
      loadImages()
    }
  }, [session])

  const handleAuth = async () => {
    setAuthError('')
    setAuthLoading(true)

    if (authMode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setAuthError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setAuthError(error.message)
      else setAuthError('Account created! You can now login.')
    }
    setAuthLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setImages([])
    setAccessToken(null)
  }

  const loadImages = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setImages(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select an image first!')
      setTimeout(() => setMessage(''), 2000)
      return
    }

    setUploading(true)
    setMessage('')
    
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`
    const filePath = `uploads/${fileName}`

    try {
      const { error: uploadError } = await supabase.storage
        .from('product_images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('product_images')
        .getPublicUrl(filePath)

      const { error: dbError } = await supabase
        .from('images')
        .insert([{ 
          name: file.name, 
          url: urlData.publicUrl,
          user_id: session?.user?.id
        }])

      if (dbError) throw dbError

      setMessage('✅ Upload successful!')
      setTimeout(() => {
        setFile(null)
        setPreview(null)
        setShowUploadModal(false)
        loadImages()
        setMessage('')
      }, 1500)
    } catch (error) {
      setMessage('❌ Upload failed: ' + error.message)
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setUploading(false)
    }
  }

  // Upload to Google Drive
  const uploadToGoogleDrive = async (imageUrl, imageName, imageId) => {
    if (!accessToken) {
      setMessage('🔐 Please connect to Google Drive first')
      googleLogin()
      return
    }
    
    setSavingToDrive(true)
    setMessage('📤 Uploading to Google Drive...')
    
    try {
      // Fetch the image from Supabase
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      
      // Create file metadata
      const metadata = {
        name: imageName,
        parents: [DRIVE_FOLDER_ID],
        mimeType: blob.type
      }
      
      // Create form data for upload
      const formData = new FormData()
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
      formData.append('file', blob)
      
      // Upload to Google Drive
      const uploadResponse = await axios.post(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/related'
          }
        }
      )
      
      if (uploadResponse.data.id) {
        // Delete from Supabase after successful upload
        const fileName = imageUrl.split('/').pop()
        await supabase.storage.from('product_images').remove([`uploads/${fileName}`])
        await supabase.from('images').delete().eq('id', imageId)
        
        setMessage('✅ Image saved to Google Drive!')
        loadImages()
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setMessage('❌ Upload failed. Please try again.')
      if (error.response?.status === 401) {
        setAccessToken(null)
      }
    } finally {
      setSavingToDrive(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const confirmDelete = (id, url) => {
    setDeleteId({ id, url })
    setShowDeleteConfirm(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    
    try {
      const fileName = deleteId.url.split('/').pop()
      await supabase.storage.from('product_images').remove([`uploads/${fileName}`])
      await supabase.from('images').delete().eq('id', deleteId.id)
      setShowDeleteConfirm(false)
      setDeleteId(null)
      loadImages()
      setMessage('🗑️ Image deleted!')
      setTimeout(() => setMessage(''), 2000)
    } catch (error) {
      setMessage('❌ Delete failed: ' + error.message)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  // Login/Signup Screen
  if (!session) {
    return (
      <div style={loginStyles.container}>
        <div style={loginStyles.card}>
          <div style={loginStyles.header}>
            <div style={loginStyles.icon}>💕</div>
            <h1 style={loginStyles.title}>RIO & ANGEL</h1>
            <p style={loginStyles.subtitle}>Our Precious Memories</p>
          </div>
          
          <div style={loginStyles.toggle}>
            <button 
              onClick={() => setAuthMode('login')}
              style={authMode === 'login' ? loginStyles.activeToggle : loginStyles.inactiveToggle}
            >
              Sign In
            </button>
            <button 
              onClick={() => setAuthMode('signup')}
              style={authMode === 'signup' ? loginStyles.activeToggle : loginStyles.inactiveToggle}
            >
              Sign Up
            </button>
          </div>
          
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={loginStyles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={loginStyles.input}
            onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
          />
          
          {authError && (
            <div style={authError.includes('created') ? loginStyles.success : loginStyles.error}>
              {authError}
            </div>
          )}
          
          <button onClick={handleAuth} disabled={authLoading} style={loginStyles.button}>
            {authLoading ? 'Loading...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
          
          <p style={loginStyles.footer}>
            {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} style={loginStyles.link}>
              {authMode === 'login' ? 'Sign Up' : 'Sign In'}
            </span>
          </p>
        </div>
      </div>
    )
  }

  // Main App Screen
  return (
    <div style={mainStyles.app}>
      {/* Animated Background */}
      <div style={mainStyles.bg}>
        <div style={mainStyles.circle1}></div>
        <div style={mainStyles.circle2}></div>
        <div style={mainStyles.circle3}></div>
      </div>

      {/* Header */}
      <div style={mainStyles.header}>
        <div style={mainStyles.headerContent}>
          <div style={mainStyles.logo}>
            <span>💕</span>
            <h1>RIO & ANGEL</h1>
          </div>
          <div style={mainStyles.headerButtons}>
            {!accessToken && (
              <button onClick={googleLogin} style={mainStyles.driveConnectBtn}>
                🔗 Connect Drive
              </button>
            )}
            <button onClick={handleLogout} style={mainStyles.logoutBtn}>🚪 Logout</button>
          </div>
        </div>
        <p style={mainStyles.welcome}>Welcome back, {session.user.email?.split('@')[0]}! ✨</p>
        {accessToken && (
          <p style={mainStyles.driveStatus}>✅ Google Drive connected</p>
        )}
      </div>

      <div style={mainStyles.container}>
        {/* Add Button */}
        <button onClick={() => setShowUploadModal(true)} style={mainStyles.addBtn}>
          <span>📸</span> Add New Memory
        </button>

        {/* Gallery Section */}
        <div style={mainStyles.galleryCard}>
          <div style={mainStyles.galleryHeader}>
            <span>🖼️</span>
            <h2>Our Gallery</h2>
            <span style={mainStyles.count}>{images.length} memories</span>
          </div>
          
          {loading ? (
            <div style={mainStyles.loading}>
              <div style={mainStyles.spinner}></div>
              <p>Loading memories...</p>
            </div>
          ) : images.length === 0 ? (
            <div style={mainStyles.empty}>
              <div style={mainStyles.emptyIcon}>💕</div>
              <h3>No memories yet</h3>
              <p>Tap the button above to add your first memory</p>
            </div>
          ) : (
            <div style={mainStyles.grid}>
              {images.map((img) => (
                <div key={img.id} style={mainStyles.card}>
                  <div style={mainStyles.cardImageWrapper}>
                    <img 
                      src={img.url} 
                      style={mainStyles.cardImage}
                      onClick={() => setSelectedImage(img.url)}
                      alt={img.name}
                    />
                    <div style={mainStyles.cardOverlay}>
                      <button onClick={() => setSelectedImage(img.url)} style={mainStyles.overlayBtn}>🔍 View</button>
                    </div>
                  </div>
                  <div style={mainStyles.cardInfo}>
                    <p style={mainStyles.cardName}>{img.name.length > 20 ? img.name.substring(0,20) + '...' : img.name}</p>
                    <p style={mainStyles.cardDate}>{new Date(img.created_at).toLocaleDateString()}</p>
                    <div style={mainStyles.cardButtons}>
                      <button onClick={() => setSelectedImage(img.url)} style={mainStyles.viewBtn}>View</button>
                      <button 
                        onClick={() => uploadToGoogleDrive(img.url, img.name, img.id)} 
                        disabled={savingToDrive}
                        style={savingToDrive ? mainStyles.driveBtnDisabled : mainStyles.driveBtn}
                      >
                        {savingToDrive ? 'Saving...' : '📤 Save to Drive'}
                      </button>
                      <button onClick={() => confirmDelete(img.id, img.url)} style={mainStyles.deleteBtn}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={mainStyles.modalOverlay} onClick={() => setShowUploadModal(false)}>
          <div style={mainStyles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={mainStyles.modalHeader}>
              <h3>📸 Add New Memory</h3>
              <button onClick={() => setShowUploadModal(false)} style={mainStyles.modalClose}>✖</button>
            </div>
            
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const selected = e.target.files[0]
                if (selected) {
                  setFile(selected)
                  const reader = new FileReader()
                  reader.onload = (e) => setPreview(e.target.result)
                  reader.readAsDataURL(selected)
                }
              }}
              style={mainStyles.fileInput}
            />
            
            {!preview ? (
              <label htmlFor="fileInput" style={mainStyles.uploadLabel}>
                <div style={mainStyles.uploadIcon}>📤</div>
                <p>Click to choose a photo</p>
                <span>JPG, PNG, GIF, WebP up to 50MB</span>
              </label>
            ) : (
              <div style={mainStyles.previewContainer}>
                <img src={preview} style={mainStyles.previewImage} />
                <button onClick={() => {
                  setPreview(null)
                  setFile(null)
                  const input = document.getElementById('fileInput')
                  if (input) input.value = ''
                }} style={mainStyles.removePreview}>✖</button>
              </div>
            )}
            
            {preview && (
              <button onClick={handleUpload} disabled={uploading} style={mainStyles.uploadBtn}>
                {uploading ? 'Uploading...' : '💾 Save Memory'}
              </button>
            )}
            
            {message && (
              <div style={message.includes('✅') ? mainStyles.successMsg : mainStyles.errorMsg}>
                {message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={mainStyles.modalOverlay} onClick={() => setShowDeleteConfirm(false)}>
          <div style={mainStyles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div style={mainStyles.confirmIcon}>🗑️</div>
            <h3>Delete Memory?</h3>
            <p>This action cannot be undone.</p>
            <div style={mainStyles.confirmButtons}>
              <button onClick={() => setShowDeleteConfirm(false)} style={mainStyles.cancelBtn}>Cancel</button>
              <button onClick={handleDelete} style={mainStyles.confirmDeleteBtn}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Image View Modal */}
      {selectedImage && (
        <div style={mainStyles.modalOverlay} onClick={() => setSelectedImage(null)}>
          <div style={mainStyles.imageModal} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedImage(null)} style={mainStyles.imageModalClose}>✖</button>
            <img src={selectedImage} style={mainStyles.fullImage} alt="Memory" />
          </div>
        </div>
      )}
    </div>
  )
}

// Login Styles
const loginStyles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '32px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  icon: {
    fontSize: '60px',
    marginBottom: '10px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '5px',
  },
  subtitle: {
    color: '#666',
    fontSize: '14px',
  },
  toggle: {
    display: 'flex',
    gap: '10px',
    marginBottom: '25px',
  },
  activeToggle: {
    flex: 1,
    background: 'linear-gradient(135deg, #e91e63 0%, #f5576c 100%)',
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  inactiveToggle: {
    flex: 1,
    background: '#f0f0f0',
    color: '#999',
    border: 'none',
    padding: '12px',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    marginBottom: '15px',
    borderRadius: '50px',
    border: '2px solid #eee',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    background: 'linear-gradient(135deg, #e91e63 0%, #f5576c 100%)',
    color: 'white',
    padding: '14px',
    border: 'none',
    borderRadius: '50px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  footer: {
    textAlign: 'center',
    marginTop: '20px',
    color: '#999',
    fontSize: '13px',
  },
  link: {
    color: '#e91e63',
    cursor: 'pointer',
    fontWeight: '600',
  },
  error: {
    background: '#fee',
    color: '#dc3545',
    padding: '10px',
    borderRadius: '10px',
    fontSize: '13px',
    textAlign: 'center',
    marginBottom: '15px',
  },
  success: {
    background: '#e8f5e9',
    color: '#28a745',
    padding: '10px',
    borderRadius: '10px',
    fontSize: '13px',
    textAlign: 'center',
    marginBottom: '15px',
  },
}

// Main App Styles
const mainStyles = {
  app: {
    minHeight: '100vh',
    background: '#0f0c29',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative',
    overflowX: 'hidden',
  },
  bg: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  circle1: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(233,30,99,0.3) 0%, transparent 70%)',
    borderRadius: '50%',
    top: '-150px',
    left: '-150px',
  },
  circle2: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(156,39,176,0.3) 0%, transparent 70%)',
    borderRadius: '50%',
    bottom: '-200px',
    right: '-150px',
  },
  circle3: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(255,64,129,0.25) 0%, transparent 70%)',
    borderRadius: '50%',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  header: {
    position: 'relative',
    zIndex: 1,
    background: 'rgba(15,12,41,0.8)',
    backdropFilter: 'blur(20px)',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
  },
  headerButtons: {
    display: 'flex',
    gap: '10px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'white',
    fontSize: '22px',
    fontWeight: 'bold',
  },
  driveConnectBtn: {
    background: '#4285f4',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '50px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
  },
  logoutBtn: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '8px 20px',
    borderRadius: '50px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
  },
  welcome: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.6)',
    marginTop: '12px',
    fontSize: '14px',
  },
  driveStatus: {
    textAlign: 'center',
    color: '#4285f4',
    marginTop: '8px',
    fontSize: '12px',
  },
  container: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
  },
  addBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #e91e63 0%, #f5576c 100%)',
    color: 'white',
    padding: '16px',
    border: 'none',
    borderRadius: '60px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  galleryCard: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    padding: '24px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  galleryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '2px solid rgba(233,30,99,0.3)',
    color: 'white',
  },
  count: {
    marginLeft: 'auto',
    background: 'rgba(233,30,99,0.2)',
    padding: '4px 12px',
    borderRadius: '50px',
    color: '#ff9a9e',
    fontSize: '13px',
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    color: 'rgba(255,255,255,0.6)',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '3px solid rgba(255,255,255,0.1)',
    borderTop: '3px solid #e91e63',
    borderRadius: '50%',
    margin: '0 auto 16px',
    animation: 'spin 1s linear infinite',
  },
  empty: {
    textAlign: 'center',
    padding: '60px',
    color: 'rgba(255,255,255,0.5)',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '20px',
    overflow: 'hidden',
  },
  cardImageWrapper: {
    position: 'relative',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    cursor: 'pointer',
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
  },
  overlayBtn: {
    background: 'linear-gradient(135deg, #e91e63 0%, #f5576c 100%)',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '50px',
    cursor: 'pointer',
  },
  cardInfo: {
    padding: '16px',
    color: 'white',
  },
  cardName: {
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '4px',
  },
  cardDate: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: '12px',
  },
  cardButtons: {
    display: 'flex',
    gap: '8px',
  },
  viewBtn: {
    flex: 1,
    background: 'linear-gradient(135deg, #e91e63 0%, #f5576c 100%)',
    color: 'white',
    border: 'none',
    padding: '8px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  driveBtn: {
    flex: 1,
    background: '#4285f4',
    color: 'white',
    border: 'none',
    padding: '8px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  driveBtnDisabled: {
    flex: 1,
    background: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '8px',
    borderRadius: '10px',
    fontSize: '12px',
    cursor: 'not-allowed',
  },
  deleteBtn: {
    flex: 1,
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#1a1a2e',
    borderRadius: '28px',
    padding: '28px',
    width: '500px',
    maxWidth: '90%',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    color: 'white',
  },
  modalClose: {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    color: 'white',
    fontSize: '20px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    cursor: 'pointer',
  },
  fileInput: {
    display: 'none',
  },
  uploadLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '50px 20px',
    border: '2px dashed rgba(255,255,255,0.2)',
    borderRadius: '20px',
    cursor: 'pointer',
    textAlign: 'center',
    color: 'white',
  },
  uploadIcon: {
    fontSize: '48px',
  },
  previewContainer: {
    position: 'relative',
    textAlign: 'center',
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '300px',
    borderRadius: '16px',
  },
  removePreview: {
    position: 'absolute',
    top: '-10px',
    right: '-10px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
  },
  uploadBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #e91e63 0%, #f5576c 100%)',
    color: 'white',
    padding: '14px',
    border: 'none',
    borderRadius: '60px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '20px',
  },
  confirmModal: {
    background: '#1a1a2e',
    borderRadius: '28px',
    padding: '32px',
    width: '340px',
    maxWidth: '90%',
    textAlign: 'center',
  },
  confirmIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  confirmButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  cancelBtn: {
    flex: 1,
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '50px',
    cursor: 'pointer',
  },
  confirmDeleteBtn: {
    flex: 1,
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '50px',
    cursor: 'pointer',
  },
  imageModal: {
    position: 'relative',
    maxWidth: '90%',
    maxHeight: '90%',
  },
  imageModalClose: {
    position: 'absolute',
    top: '-40px',
    right: '0',
    background: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    cursor: 'pointer',
  },
  fullImage: {
    maxWidth: '100%',
    maxHeight: '85vh',
    borderRadius: '16px',
  },
  successMsg: {
    marginTop: '16px',
    padding: '12px',
    background: 'rgba(40,167,69,0.2)',
    border: '1px solid rgba(40,167,69,0.5)',
    color: '#28a745',
    borderRadius: '12px',
    textAlign: 'center',
  },
  errorMsg: {
    marginTop: '16px',
    padding: '12px',
    background: 'rgba(220,53,69,0.2)',
    border: '1px solid rgba(220,53,69,0.5)',
    color: '#dc3545',
    borderRadius: '12px',
    textAlign: 'center',
  },
}

// Add animation
const styleSheet = document.createElement("style")
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .card:hover .card-overlay {
    opacity: 1;
  }
`
document.head.appendChild(styleSheet)

export default App