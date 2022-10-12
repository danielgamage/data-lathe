import React, { useState } from "react"

const Button = ({ label, confirmLabel, onClick, ...props }) => {
  const requiresConfirmation = !!confirmLabel
  const [clickedOnce, setClicked] = useState(false)

  return (
    <button
      {...props}
      onClick={() => {
        if (!requiresConfirmation || clickedOnce) {
          onClick()
          setClicked(false)
        } else {
          setClicked(true)

          // Unset after 5s
          setTimeout(() => {
            setClicked(false)
          }, 5000)
        }
      }}
    >
      {clickedOnce ? confirmLabel : label}
    </button>
  )
}
export default Button
