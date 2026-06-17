import React, { useState } from 'react'
import styles from './FileTree.module.css'

function TreeNode({ node, depth = 0 }) {
  const [open, setOpen] = useState(depth < 2)
  const isDir = node.type === 'dir' || (node.children && node.children.length > 0)

  return (
    <div className={styles.node} style={{ paddingLeft: depth * 16 }}>
      <div
        className={`${styles.row} ${isDir ? styles.dir : ''}`}
        onClick={() => isDir && setOpen((o) => !o)}
      >
        <span className={styles.icon}>{isDir ? (open ? '▾' : '▸') : '·'}</span>
        <span className={styles.name}>{node.name}</span>
      </div>
      {isDir && open && node.children?.map((child, i) => (
        <TreeNode key={i} node={child} depth={depth + 1} />
      ))}
    </div>
  )
}

export default function FileTree({ tree }) {
  if (!tree) return null
  const nodes = Array.isArray(tree) ? tree : [tree]
  return (
    <div className={styles.container}>
      {nodes.map((node, i) => <TreeNode key={i} node={node} />)}
    </div>
  )
}