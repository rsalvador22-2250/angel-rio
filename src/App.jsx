import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useGoogleLogin } from '@react-oauth/google'
import axios from 'axios'

const supabaseUrl = 'https://exnqeehprojsztisilrn.supabase.co'
const supabaseAnonKey = 'sb_publishable_IHLqi9GtKPK0-h31l1X_nw_KBaHUC8X'
const supabase = createClient(supabaseUrl, supabaseAnonKey)
const DRIVE_FOLDER_ID = '1YymETCvIJN1vA_Hvg8uDo4Rv8Np7N-8g'

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --cream:  #F5F0E8;
  --tan:    #E8DFC8;
  --ink:    #1A1612;
  --rust:   #C0392B;
  --muted:  #8A7F6E;
  --border: #C8BEAA;
  --white:  #FDFAF4;
}

body {
  background: var(--cream);
  color: var(--ink);
  font-family: 'IBM Plex Mono', monospace;
  -webkit-font-smoothing: antialiased;
}

.stamp {
  display: inline-block;
  padding: 3px 8px;
  border: 1.5px solid var(--ink);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--ink);
  background: var(--white);
}
.stamp.rust { background: var(--rust); color: var(--white); border-color: var(--rust); }
.stamp.tan  { background: var(--tan); }

.header {
  background: var(--ink);
  position: sticky;
  top: 0;
  z-index: 20;
}
.header-row {
  max-width: 1360px;
  margin: 0 auto;
  display: flex;
  align-items: stretch;
  height: 60px;
}
.logo-block {
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-right: 1.5px solid #333;
}
.logo-mark {
  width: 28px;
  height: 28px;
  background: var(--rust);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Playfair Display', serif;
  font-size: 14px;
  font-style: italic;
  color: var(--white);
  flex-shrink: 0;
}
.logo-text {
  font-family: 'Playfair Display', serif;
  font-size: 14px;
  font-weight: 700;
  color: var(--white);
  letter-spacing: -0.3px;
}
.logo-sub {
  font-size: 7px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #666;
  margin-top: 1px;
}
.header-meta {
  padding: 0 12px;
  display: flex;
  align-items: center;
  font-size: 10px;
  letter-spacing: 0.5px;
  color: #666;
  border-right: 1.5px solid #333;
}
.header-spacer { flex: 1; }
.hbtn {
  padding: 0 16px;
  background: transparent;
  border: none;
  border-left: 1.5px solid #333;
  color: #999;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  height: 100%;
  transition: background .15s, color .15s;
  white-space: nowrap;
}
.hbtn:hover { background: #2A2520; color: var(--white); }
.hbtn.active { background: var(--rust); color: var(--white); border-left-color: var(--rust); }

.page {
  max-width: 1360px;
  margin: 0 auto;
  padding: 24px 16px 60px;
}

@media (min-width: 768px) {
  .page {
    padding: 40px 32px 80px;
  }
  .logo-block {
    padding: 0 28px;
    gap: 14px;
  }
  .logo-mark {
    width: 30px;
    height: 30px;
    font-size: 16px;
  }
  .logo-text {
    font-size: 17px;
  }
  .logo-sub {
    font-size: 9px;
  }
  .header-meta {
    padding: 0 20px;
    font-size: 11px;
  }
  .hbtn {
    padding: 0 24px;
    font-size: 11px;
  }
}

.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 3px solid var(--ink);
  flex-wrap: wrap;
  gap: 16px;
}
.page-title {
  font-family: 'Playfair Display', serif;
  font-size: 36px;
  font-weight: 900;
  line-height: 1;
  color: var(--ink);
  letter-spacing: -2px;
}
@media (min-width: 768px) {
  .page-title {
    font-size: 52px;
  }
  .page-head {
    margin-bottom: 36px;
    padding-bottom: 24px;
  }
}
.page-title em { font-style: italic; color: var(--rust); }
.page-head-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.count-badge {
  padding: 6px 12px;
  background: var(--tan);
  border: 1.5px solid var(--border);
  font-size: 10px;
  letter-spacing: 1px;
  color: var(--muted);
  white-space: nowrap;
}
@media (min-width: 768px) {
  .count-badge {
    padding: 8px 18px;
    font-size: 11px;
  }
}

.add-btn {
  padding: 10px 20px;
  background: var(--ink);
  border: 2px solid var(--ink);
  color: var(--white);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  cursor: pointer;
  position: relative;
  transition: background .15s;
  white-space: nowrap;
}
@media (min-width: 768px) {
  .add-btn {
    padding: 12px 28px;
    font-size: 12px;
  }
}
.add-btn::after {
  content: '';
  position: absolute;
  inset: 3px -3px -3px 3px;
  border: 2px solid var(--ink);
  pointer-events: none;
}
.add-btn:hover { background: var(--rust); border-color: var(--rust); }
.add-btn:hover::after { border-color: var(--rust); }

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

@media (min-width: 640px) {
  .gallery-grid {
    gap: 24px;
  }
}

@media (min-width: 1024px) {
  .gallery-grid {
    gap: 28px;
  }
}

.mem-card {
  background: var(--white);
  border: 2px solid var(--ink);
  position: relative;
  transition: transform .15s;
}
.mem-card::after {
  content: '';
  position: absolute;
  inset: 4px -4px -4px 4px;
  border: 2px solid var(--ink);
  z-index: -1;
  pointer-events: none;
}
.mem-card:hover { transform: translate(-2px, -2px); }
.mem-card:hover::after { inset: 6px -6px -6px 6px; }

.card-img-frame {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4/3;
  border-bottom: 2px solid var(--ink);
  background: var(--tan);
  cursor: pointer;
}
.card-img-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform .4s;
}
.mem-card:hover .card-img-frame img { transform: scale(1.04); }

.card-corner-stamp {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
}

.card-body { padding: 12px 12px 14px; }
@media (min-width: 768px) {
  .card-body { padding: 14px 16px 16px; }
}
.card-name {
  font-family: 'Playfair Display', serif;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}
@media (min-width: 768px) {
  .card-name {
    font-size: 15px;
  }
}
.card-date {
  font-size: 9px;
  letter-spacing: 1px;
  color: var(--muted);
  margin-bottom: 12px;
}
@media (min-width: 768px) {
  .card-date {
    font-size: 10px;
    margin-bottom: 14px;
  }
}

/* Music Player Styles */
.music-player {
  background: var(--tan);
  border: 1.5px solid var(--border);
  padding: 8px;
  margin-bottom: 12px;
  border-radius: 4px;
}
.song-badge {
  background: var(--rust);
  color: var(--white);
  padding: 2px 6px;
  font-size: 8px;
  letter-spacing: 1px;
  display: inline-block;
  margin-bottom: 4px;
}
.audio-player {
  width: 100%;
  height: 30px;
  margin-top: 6px;
}
.audio-player audio {
  width: 100%;
  height: 30px;
}

.card-actions { 
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}
.ca {
  padding: 6px 4px;
  background: transparent;
  border: 1.5px solid var(--border);
  color: var(--muted);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 8px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all .12s;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
@media (min-width: 480px) {
  .ca {
    font-size: 9px;
    letter-spacing: 0.5px;
    padding: 7px 6px;
  }
}
@media (min-width: 768px) {
  .ca {
    font-size: 10px;
    padding: 7px 6px;
  }
}
.ca:hover { border-color: var(--ink); color: var(--ink); background: var(--tan); }
.ca.ca-drive:hover { border-color: #1a5bb5; color: #1a5bb5; background: #EEF4FF; }
.ca.ca-download:hover { border-color: #27AE60; color: #27AE60; background: #F0FAF4; }
.ca.ca-del:hover { border-color: var(--rust); color: var(--rust); background: #FEF0EE; }
.ca:disabled { opacity: .3; cursor: not-allowed; }

.state-box {
  border: 2px solid var(--border);
  padding: 60px 20px;
  text-align: center;
  background: var(--white);
}
@media (min-width: 768px) {
  .state-box {
    padding: 80px 32px;
  }
}
.state-eyebrow {
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 12px;
}
.state-heading {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--ink);
}
@media (min-width: 768px) {
  .state-heading {
    font-size: 26px;
  }
}
.ring {
  width: 36px; height: 36px;
  border: 2px solid var(--border);
  border-top-color: var(--rust);
  border-radius: 50%;
  margin: 0 auto 14px;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.toast-wrap {
  position: fixed;
  bottom: 20px;
  right: 20px;
  left: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}
@media (min-width: 768px) {
  .toast-wrap {
    left: auto;
    bottom: 28px;
    right: 28px;
  }
}
.toast {
  padding: 10px 16px;
  background: var(--ink);
  color: var(--white);
  font-size: 11px;
  letter-spacing: 0.5px;
  border-left: 4px solid var(--rust);
  animation: fadeup .2s ease;
  word-break: break-word;
}
.toast.ok { border-left-color: #27AE60; }
@keyframes fadeup { from { transform: translateY(8px); opacity: 0; } to { transform: none; opacity: 1; } }

.overlay {
  position: fixed; inset: 0;
  background: rgba(26,22,18,0.82);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 16px;
}

.modal {
  background: var(--white);
  border: 2px solid var(--ink);
  width: 100%; max-width: 500px;
  position: relative;
  margin: 16px;
}
.modal::after {
  content: '';
  position: absolute;
  inset: 5px -5px -5px 5px;
  border: 2px solid var(--ink);
  z-index: -1; pointer-events: none;
}
.modal-head {
  background: var(--ink);
  padding: 14px 16px;
  display: flex; align-items: center; justify-content: space-between;
}
@media (min-width: 768px) {
  .modal-head {
    padding: 16px 20px;
  }
}
.modal-title {
  font-family: 'Playfair Display', serif;
  font-size: 14px;
  font-weight: 700;
  color: var(--white);
}
@media (min-width: 768px) {
  .modal-title {
    font-size: 16px;
  }
}
.modal-x {
  width: 28px; height: 28px;
  background: #333; border: none; color: #999;
  font-size: 14px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .12s, color .12s;
}
.modal-x:hover { background: var(--rust); color: var(--white); }
.modal-body { padding: 20px; }
@media (min-width: 768px) {
  .modal-body { padding: 24px; }
}

.upload-zone {
  border: 2px dashed var(--border);
  padding: 32px 16px;
  text-align: center; cursor: pointer;
  transition: border-color .15s, background .15s;
  background: var(--cream);
  display: block;
}
@media (min-width: 768px) {
  .upload-zone {
    padding: 44px 20px;
  }
}
.upload-zone:hover { border-color: var(--ink); background: var(--tan); }
.upload-zone-icon { font-size: 28px; color: var(--muted); margin-bottom: 8px; }
.upload-zone p { font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: var(--muted); margin-bottom: 4px; }
.upload-zone span { font-size: 9px; color: var(--border); letter-spacing: 0.5px; }

.preview-wrap { position: relative; }
.preview-img { width: 100%; max-height: 260px; object-fit: contain; border: 2px solid var(--border); display: block; }
.rm-prev {
  position: absolute; top: -11px; right: -11px;
  width: 26px; height: 26px;
  background: var(--rust); border: none; color: var(--white);
  font-size: 13px; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}

.upload-submit {
  width: 100%; margin-top: 18px; padding: 12px;
  background: var(--ink); border: 2px solid var(--ink); color: var(--white);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase;
  cursor: pointer; transition: background .15s;
}
@media (min-width: 768px) {
  .upload-submit {
    padding: 14px;
    font-size: 12px;
  }
}
.upload-submit:hover { background: var(--rust); border-color: var(--rust); }
.upload-submit:disabled { background: var(--border); border-color: var(--border); cursor: not-allowed; color: var(--muted); }

.confirm-modal {
  background: var(--white);
  border: 2px solid var(--rust);
  width: 340px;
  max-width: calc(100vw - 32px);
  position: relative;
}
.confirm-modal::after {
  content: '';
  position: absolute;
  inset: 5px -5px -5px 5px;
  border: 2px solid var(--rust);
  z-index: -1; pointer-events: none;
}
.confirm-head { background: var(--rust); padding: 14px 16px; }
.confirm-head-text { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: var(--white); }
.confirm-body { padding: 20px 16px; }
.confirm-sub { font-size: 11px; color: var(--muted); letter-spacing: 0.5px; margin-top: 6px; }
.confirm-actions { display: flex; border-top: 1.5px solid var(--border); }
.conf-cancel, .conf-delete {
  flex: 1; padding: 12px; border: none;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px; letter-spacing: 1px; text-transform: uppercase;
  cursor: pointer; transition: background .12s, color .12s;
}
@media (min-width: 768px) {
  .conf-cancel, .conf-delete {
    padding: 14px;
    font-size: 11px;
  }
}
.conf-cancel { background: var(--cream); color: var(--muted); border-right: 1.5px solid var(--border); }
.conf-cancel:hover { background: var(--tan); color: var(--ink); }
.conf-delete { background: var(--rust); color: var(--white); }
.conf-delete:hover { background: #a93226; }

.viewer-wrap { 
  position: relative; 
  max-width: 95vw; 
  max-height: 90vh;
}
.viewer-wrap img {
  display: block; 
  max-width: 95vw; 
  max-height: 85vh;
  object-fit: contain; 
  border: 3px solid var(--white);
}
.viewer-close {
  position: absolute; 
  top: -12px; 
  right: -12px;
  width: 32px; 
  height: 32px;
  background: var(--white); 
  border: none;
  color: var(--ink); 
  font-size: 14px; 
  font-weight: 700; 
  cursor: pointer;
}
@media (min-width: 768px) {
  .viewer-close {
    top: -14px;
    right: -14px;
    width: 34px;
    height: 34px;
    font-size: 15px;
  }
}
.viewer-close:hover { background: var(--rust); color: var(--white); }

.login-wrap {
  min-height: 100vh;
  background: var(--cream);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.login-panel { width: 100%; max-width: 440px; }
.login-masthead { margin-bottom: 24px; }
@media (min-width: 768px) {
  .login-masthead { margin-bottom: 32px; }
}
.login-eyebrow { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
.login-name {
  font-family: 'Playfair Display', serif;
  font-size: 36px;
  font-weight: 900;
  color: var(--ink);
  line-height: 1;
  letter-spacing: -2px;
}
@media (min-width: 768px) {
  .login-name {
    font-size: 48px;
  }
}
.login-name em { font-style: italic; color: var(--rust); }
.login-rule { width: 40px; height: 3px; background: var(--rust); margin: 12px 0; }
.login-tagline { font-size: 11px; color: var(--muted); letter-spacing: 0.5px; }

.login-card {
  background: var(--white);
  border: 2px solid var(--ink);
  position: relative;
}
.login-card::after {
  content: '';
  position: absolute;
  inset: 5px -5px -5px 5px;
  border: 2px solid var(--ink);
  z-index: -1; pointer-events: none;
}
.login-tabs { display: flex; border-bottom: 2px solid var(--ink); }
.ltab {
  flex: 1; padding: 12px;
  background: transparent; border: none;
  border-right: 1.5px solid var(--ink);
  color: var(--muted);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all .12s;
}
.ltab:last-child { border-right: none; }
.ltab.on { background: var(--ink); color: var(--white); }
.ltab:not(.on):hover { background: var(--tan); color: var(--ink); }

.login-fields { padding: 20px; }
@media (min-width: 768px) {
  .login-fields { padding: 24px; }
}
.l-input {
  display: block; width: 100%;
  padding: 10px 12px; margin-bottom: 12px;
  background: var(--cream);
  border: 1.5px solid var(--border);
  color: var(--ink);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px; outline: none;
  transition: border-color .15s;
}
.l-input:focus { border-color: var(--ink); background: var(--white); }
.l-input::placeholder { color: var(--border); }
.l-alert {
  padding: 8px 10px; margin-bottom: 14px;
  font-size: 10px; letter-spacing: 0.3px;
  border-left: 3px solid var(--rust);
  background: #FEF0EE; color: var(--rust);
}
.l-alert.ok { border-left-color: #27AE60; background: #F0FAF4; color: #1E6B40; }
.l-submit {
  width: 100%; padding: 12px;
  background: var(--ink); border: 2px solid var(--ink); color: var(--white);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
  cursor: pointer; transition: background .15s, border-color .15s;
}
@media (min-width: 768px) {
  .l-submit {
    padding: 14px;
    font-size: 12px;
  }
}
.l-submit:hover { background: var(--rust); border-color: var(--rust); }
.l-submit:disabled { background: var(--border); border-color: var(--border); cursor: not-allowed; }
`

function Toast({ msgs }) {
  return (
    <div className="toast-wrap">
      {msgs.map((m, i) => <div key={i} className={`toast ${m.ok ? 'ok' : ''}`}>{m.text}</div>)}
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMode, setAuthMode] = useState('login')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [toasts, setToasts] = useState([])
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [savingToDrive, setSavingToDrive] = useState(false)
  const [accessToken, setAccessToken] = useState(null)
  const [downloading, setDownloading] = useState(false)

  const toast = (text, ok = false) => {
    const id = Date.now()
    setToasts(t => [...t, { text, ok, id }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200)
  }

  const googleLogin = useGoogleLogin({
    onSuccess: t => { setAccessToken(t.access_token); toast('Google Drive connected', true) },
    onError: () => toast('Google login failed'),
    scope: 'https://www.googleapis.com/auth/drive.file'
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => { if (session) loadImages() }, [session])

  const handleAuth = async () => {
    setAuthError(''); setAuthLoading(true)
    if (authMode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setAuthError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setAuthError(error.message)
      else setAuthError('ok:Account created — sign in now')
    }
    setAuthLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut(); setImages([]); setAccessToken(null)
  }

  const loadImages = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('images').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setImages(data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`
    try {
      const { error: ue } = await supabase.storage.from('product_images').upload(`uploads/${fileName}`, file)
      if (ue) throw ue
      const { data: { publicUrl } } = supabase.storage.from('product_images').getPublicUrl(`uploads/${fileName}`)
      const { error: de } = await supabase.from('images').insert([{ 
        name: file.name, 
        url: publicUrl, 
        user_id: session?.user?.id
      }])
      if (de) throw de
      toast('Memory saved', true)
      setTimeout(() => { 
        setFile(null); 
        setPreview(null); 
        setShowUpload(false); 
        loadImages() 
      }, 1200)
    } catch (e) { toast('Upload failed: ' + e.message) }
    finally { setUploading(false) }
  }

  const uploadToDrive = async (url, name, id) => {
    if (!accessToken) { toast('Connect Google Drive first'); googleLogin(); return }
    setSavingToDrive(true); toast('Uploading to Drive…')
    try {
      const blob = await (await fetch(url)).blob()
      const fd = new FormData()
      fd.append('metadata', new Blob([JSON.stringify({ name, parents: [DRIVE_FOLDER_ID], mimeType: blob.type })], { type: 'application/json' }))
      fd.append('file', blob)
      const res = await axios.post('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', fd, {
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'multipart/related' }
      })
      if (res.data.id) {
        await supabase.storage.from('product_images').remove([`uploads/${url.split('/').pop()}`])
        await supabase.from('images').delete().eq('id', id)
        toast('Saved to Drive', true); loadImages()
      } else throw new Error()
    } catch (e) {
      toast('Drive upload failed')
      if (e.response?.status === 401) setAccessToken(null)
    } finally { setSavingToDrive(false) }
  }

  const downloadImage = async (url, name) => {
    setDownloading(true)
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = name || 'memory.jpg'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
      toast('Download started', true)
    } catch (e) {
      toast('Download failed: ' + e.message)
    } finally {
      setDownloading(false)
    }
  }

  const doDelete = async () => {
    if (!deleteTarget) return
    try {
      await supabase.storage.from('product_images').remove([`uploads/${deleteTarget.url.split('/').pop()}`])
      await supabase.from('images').delete().eq('id', deleteTarget.id)
      setDeleteTarget(null); loadImages(); toast('Memory removed')
    } catch (e) { toast('Delete failed: ' + e.message) }
  }

  if (!session) {
    const isOk = authError.startsWith('ok:')
    const msg = isOk ? authError.slice(3) : authError
    return (
      <>
        <style>{CSS}</style>
        <div className="login-wrap">
          <div className="login-panel">
            <div className="login-masthead">
              <p className="login-eyebrow">Private photo album</p>
              <h1 className="login-name">Rio &amp; <em>Angel</em></h1>
              <div className="login-rule" />
              <p className="login-tagline">Our precious memories, stored safely.</p>
            </div>
            <div className="login-card">
              <div className="login-tabs">
                <button className={`ltab ${authMode === 'login' ? 'on' : ''}`} onClick={() => setAuthMode('login')}>Sign in</button>
                <button className={`ltab ${authMode === 'signup' ? 'on' : ''}`} onClick={() => setAuthMode('signup')}>Sign up</button>
              </div>
              <div className="login-fields">
                {authError && <div className={`l-alert ${isOk ? 'ok' : ''}`}>{msg}</div>}
                <input className="l-input" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
                <input className="l-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                  style={{ marginBottom: 20 }} onKeyPress={e => e.key === 'Enter' && handleAuth()} />
                <button className="l-submit" onClick={handleAuth} disabled={authLoading}>
                  {authLoading ? 'Loading…' : authMode === 'login' ? 'Sign in' : 'Create account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>

        <header className="header">
          <div className="header-row">
            <div className="logo-block">
              <div className="logo-mark">R</div>
              <div>
                <div className="logo-text">Rio & Angel</div>
                <div className="logo-sub">Memories</div>
              </div>
            </div>
            <div className="header-meta">{session.user.email?.split('@')[0]}</div>
            <div className="header-spacer" />
            {!accessToken
              ? <button className="hbtn" onClick={googleLogin}>Connect Drive</button>
              : <span className="hbtn active" style={{ cursor: 'default' }}>Drive ✓</span>
            }
            <button className="hbtn" onClick={handleLogout}>Sign out</button>
          </div>
        </header>

        <main className="page">
          <div className="page-head">
            <h1 className="page-title">Our <em>Gallery</em></h1>
            <div className="page-head-right">
              <span className="count-badge">{images.length} {images.length === 1 ? 'memory' : 'memories'}</span>
              <button className="add-btn" onClick={() => setShowUpload(true)}>+ Add memory</button>
            </div>
          </div>

          {loading ? (
            <div className="state-box">
              <div className="ring" />
              <p className="state-eyebrow">Loading</p>
            </div>
          ) : images.length === 0 ? (
            <div className="state-box">
              <p className="state-eyebrow">Empty collection</p>
              <p className="state-heading">No memories yet</p>
            </div>
          ) : (
            <div className="gallery-grid">
              {images.map((img, i) => (
                <div className="mem-card" key={img.id}>
                  <div className="card-img-frame" onClick={() => setSelectedImage(img.url)}>
                    <img src={img.url} alt={img.name} />
                    <div className="card-corner-stamp">
                      <span className="stamp tan">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                  </div>
                  <div className="card-body">
                    <p className="card-name">{img.name.length > 26 ? img.name.slice(0, 26) + '…' : img.name}</p>
                    <p className="card-date">{new Date(img.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</p>
                    
                    {img.song_link && (
                      <div className="music-player">
                        <span className="song-badge">🎵 SONG</span>
                        {img.song_title && <div style={{ fontSize: '9px', marginBottom: '4px', color: 'var(--ink)' }}>{img.song_title}</div>}
                        <audio className="audio-player" controls src={img.song_link}>
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}
                    
                    <div className="card-actions">
                      <button className="ca" onClick={() => setSelectedImage(img.url)}>View</button>
                      <button className="ca ca-drive" onClick={() => uploadToDrive(img.url, img.name, img.id)} disabled={savingToDrive}>
                        {savingToDrive ? '…' : 'Drive'}
                      </button>
                      <button className="ca ca-download" onClick={() => downloadImage(img.url, img.name)} disabled={downloading}>
                        {downloading ? '…' : 'Download'}
                      </button>
                      <button className="ca ca-del" onClick={() => setDeleteTarget({ id: img.id, url: img.url })}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {showUpload && (
          <div className="overlay" onClick={() => setShowUpload(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-head">
                <span className="modal-title">Add new memory</span>
                <button className="modal-x" onClick={() => setShowUpload(false)}>✕</button>
              </div>
              <div className="modal-body">
                <input id="fi" type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => {
                    const f = e.target.files[0]
                    if (!f) return
                    setFile(f)
                    const r = new FileReader()
                    r.onload = ev => setPreview(ev.target.result)
                    r.readAsDataURL(f)
                  }} />
                {!preview ? (
                  <label htmlFor="fi" className="upload-zone">
                    <div className="upload-zone-icon">↑</div>
                    <p>Choose a photo</p>
                    <span>JPG · PNG · GIF · WebP · up to 50 MB</span>
                  </label>
                ) : (
                  <div className="preview-wrap">
                    <img className="preview-img" src={preview} alt="preview" />
                    <button className="rm-prev" onClick={() => { setPreview(null); setFile(null); document.getElementById('fi').value = '' }}>✕</button>
                  </div>
                )}
                {preview && (
                  <button className="upload-submit" onClick={handleUpload} disabled={uploading}>
                    {uploading ? 'Saving…' : 'Save memory'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {deleteTarget && (
          <div className="overlay" onClick={() => setDeleteTarget(null)}>
            <div className="confirm-modal" onClick={e => e.stopPropagation()}>
              <div className="confirm-head">
                <p className="confirm-head-text">Delete this memory?</p>
              </div>
              <div className="confirm-body">
                <p className="confirm-sub">This action cannot be undone.</p>
              </div>
              <div className="confirm-actions">
                <button className="conf-cancel" onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button className="conf-delete" onClick={doDelete}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {selectedImage && (
          <div className="overlay" onClick={() => setSelectedImage(null)}>
            <div className="viewer-wrap" onClick={e => e.stopPropagation()}>
              <button className="viewer-close" onClick={() => setSelectedImage(null)}>✕</button>
              <img src={selectedImage} alt="Memory" />
            </div>
          </div>
        )}

        <Toast msgs={toasts} />
      </div>
    </>
  )
}