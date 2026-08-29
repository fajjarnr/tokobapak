import React from 'react'
export default function Image(props: any) {
  // ponytail: shim next/image -> unpic/plain img for Vite build; covers migration T2.4
  const { src, alt, width, height, ...rest } = props
  return React.createElement('img', { src, alt, width, height, loading: 'lazy', ...rest })
}
export const getImageProps = (props: any) => ({ props })
