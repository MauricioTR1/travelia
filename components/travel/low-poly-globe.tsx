"use client"

import { useRef, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, useTexture } from "@react-three/drei"
import * as THREE from "three"

function LowPolyCloud({ position, scale, rotation }: { position: [number, number, number], scale: number, rotation: [number, number, number] }) {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      {/* A more natural cumulus cloud shape made of 4 overlapping low-poly spheres with detail=1 */}
      {/* Center puff */}
      <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[0.2, 1]} />
        <meshStandardMaterial color="#ffffff" flatShading={true} transparent opacity={0.95} roughness={1} />
      </mesh>
      {/* Left puff */}
      <mesh position={[-0.15, -0.02, 0.05]}>
        <icosahedronGeometry args={[0.12, 1]} />
        <meshStandardMaterial color="#ffffff" flatShading={true} transparent opacity={0.95} roughness={1} />
      </mesh>
      {/* Right puff */}
      <mesh position={[0.18, -0.05, -0.02]}>
        <icosahedronGeometry args={[0.14, 1]} />
        <meshStandardMaterial color="#ffffff" flatShading={true} transparent opacity={0.95} roughness={1} />
      </mesh>
      {/* Top back puff */}
      <mesh position={[0.05, 0.08, -0.1]}>
        <icosahedronGeometry args={[0.15, 1]} />
        <meshStandardMaterial color="#ffffff" flatShading={true} transparent opacity={0.95} roughness={1} />
      </mesh>
    </group>
  )
}

function CloudLayer() {
  const cloudsRef = useRef<THREE.Group>(null)

  // Generate random clouds once
  const clouds = useRef(
    Array.from({ length: 20 }).map(() => {
      const u = Math.random()
      const v = Math.random()
      const theta = u * 2.0 * Math.PI
      const phi = Math.acos(2.0 * v - 1.0)
      const r = 2.15 + Math.random() * 0.2 // Radius slightly closer to earth

      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)

      return {
        position: [x, y, z] as [number, number, number],
        scale: 0.3 + Math.random() * 0.4, // Made overall scale smaller
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [number, number, number]
      }
    })
  ).current

  useFrame((state, delta) => {
    if (cloudsRef.current) {
      // Clouds rotate a bit faster and on a slightly different axis
      cloudsRef.current.rotation.y += delta * 0.2
      cloudsRef.current.rotation.x += delta * 0.08
    }
  })

  return (
    <group ref={cloudsRef}>
      {clouds.map((c, i) => (
        <LowPolyCloud key={i} position={c.position} scale={c.scale} rotation={c.rotation} />
      ))}
    </group>
  )
}

function GlobeMesh() {
  const meshRef = useRef<THREE.Group>(null)

  // Use a specular map (water is white, land is black) as an alpha mask
  const specMap = useTexture("https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg")

  // Rotate slowly
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15
      meshRef.current.rotation.x += delta * 0.05
    }
  })

  return (
    <group ref={meshRef}>
      {/* Base layer: Land (Green) */}
      <mesh>
        {/* detail=4 keeps it low-poly but recognizable */}
        <icosahedronGeometry args={[2, 4]} />
        <meshStandardMaterial
          color="#22c55e" // Green land
          flatShading={true}
          roughness={0.9}
        />
      </mesh>

      {/* Overlay layer: Water (Blue) */}
      <mesh>
        {/* Slightly larger radius to sit on top of the land */}
        <icosahedronGeometry args={[2.002, 4]} />
        <meshStandardMaterial
          color="#0ea5e9" // Blue water
          transparent={true}
          alphaMap={specMap}
          flatShading={true}
          roughness={0.4}
        />
      </mesh>

    </group>
  )
}

export function LowPolyGlobe({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Canvas camera={{ position: [0, 0, 5.5], fov: 60 }} className="h-full w-full">
        {/* Adjusted lighting to make the earth texture look vibrant but still have that stylized vibe */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={1.5} color="#38bdf8" />

        <Suspense fallback={null}>
          <GlobeMesh />
          <CloudLayer />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
        />
      </Canvas>
    </div>
  )
}
