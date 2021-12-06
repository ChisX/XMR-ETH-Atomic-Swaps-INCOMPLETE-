// Imports
  // Modules
import React,{useState,useEffect,forwardRef,useImperativeHandle} from 'react'
  // Resources
import './notification.css'

// Settings
let THEME_FAIL = {"backgroundColor":"rgb(219,22,22)"}
let THEME_SUCC = {"backgroundColor":"var(--clr-C2)"}

// Component
let Notification = forwardRef(({theme,emblem,title,overrideStyles,motion},ref) => {
  // State
  let [aniclass,setAniclass] = useState('')
  let [invoked,setInvoked]   = useState(false)
  let [note,setNote]   = useState(title)

  useImperativeHandle(ref,() => ({
    show() {setInvoked(true)},
    notify(announcement) {setNote(announcement)}
  }))

  function closeNote() {
    setInvoked(false)
  }

  let themeStyles
  switch (theme) {
    case 'success':themeStyles = THEME_SUCC; break
    case 'failure':themeStyles = THEME_FAIL; break
    default:themeStyles = {}
  }

  useEffect(() => {
    let motionClass
    if (motion) {
      let {pos,dir} = motion
      motionClass = pos.split(',').join(' ') + ' ' + dir
    } else { motionClass = 'top middle popTop' }
    setAniclass(`notification ${motionClass} ${(invoked ? ' invoked' : '')}`)
  },[invoked,motion,theme])
  
  // Renderer
  return (
    <div id="notify">
      <h1 className={aniclass} style={{...overrideStyles,...themeStyles}}>
        <span className="notify-theme" onClick={closeNote}><i className={"fas " + emblem}></i></span>
        <span className="notify-title">{note}</span>
      </h1>
    </div>
  )
})

export default Notification