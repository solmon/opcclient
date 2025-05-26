import { useState } from 'react'
import { ServerNode } from '@/types/server'
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react'

interface ObjectModelTreeProps {
  nodes: ServerNode[]
  serverName: string
}

export function ObjectModelTree({ nodes, serverName }: ObjectModelTreeProps) {
  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">{serverName} - Object Model</h2>
      <div className="border rounded-md p-4 bg-slate-50">
        {nodes.length === 0 ? (
          <p className="text-gray-500">No nodes found</p>
        ) : (
          <div className="space-y-1">
            {nodes.map((node) => (
              <TreeNode key={node.nodeId} node={node} level={0} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface TreeNodeProps {
  node: ServerNode
  level: number
}

function TreeNode({ node, level }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasChildren = node.children && node.children.length > 0
  
  return (
    <div>
      <div 
        className={`flex items-center py-1 px-2 rounded hover:bg-slate-100 
                   ${level === 0 ? 'font-medium' : ''}`}
        style={{ paddingLeft: `${level * 16 + 4}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-slate-200 mr-1"
          >
            {isExpanded ? 
              <ChevronDown className="h-4 w-4 text-gray-500" /> : 
              <ChevronRight className="h-4 w-4 text-gray-500" />
            }
          </button>
        ) : (
          <span className="w-6 mr-1">
            {node.nodeClass === 'Variable' ? (
              <File className="h-4 w-4 text-blue-500" />
            ) : (
              <Folder className="h-4 w-4 text-yellow-500" />
            )}
          </span>
        )}
        
        <span className="truncate" title={`${node.displayName} (${node.nodeId})`}>
          {node.displayName}
        </span>
        <span className="ml-2 text-xs text-gray-500">
          {node.nodeClass}
        </span>
      </div>
      
      {isExpanded && node.children && (
        <div>
          {node.children.map((childNode) => (
            <TreeNode 
              key={childNode.nodeId} 
              node={childNode} 
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </div>
  )
}
