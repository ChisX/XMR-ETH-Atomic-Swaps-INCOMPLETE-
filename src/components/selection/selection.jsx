// Imports
  // Modules
import React from 'react'
import Select from 'react-select'
  // Resources
import './selection.css'

// Settings
let formatOptionLabel = ({value,label,icon}) => (
  <div style={{display: "flex"}}>
    <div style={{marginRight:"10px"}}><img src={icon} alt="selection-icon"/></div>
    <div style={{margin:'auto 5px'}}>{label}</div>
  </div>
)

// Component
export default function Selection(props) {
  // Renderer
  return <Select className="selection" formatOptionLabel={formatOptionLabel} {...props}/>
}