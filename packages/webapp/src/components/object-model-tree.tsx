import { useState, useMemo, useCallback } from 'react'
import { ServerNode } from '@/types/server'
import { ChevronRight, ChevronDown, File, Folder, Database, Search } from 'lucide-react'
import { SearchInput } from '@/components/search-input'

interface ObjectModelTreeProps {
  nodes: ServerNode[]
  serverName: string
}

export function ObjectModelTree({ nodes, serverName }: ObjectModelTreeProps) {
  const [searchQuery, setSearchQuery] = useState('')
  
  // Filter nodes based on search query
  const filterNodes = useCallback((nodes: ServerNode[], query: string): ServerNode[] => {
    if (!query) return nodes;
    
    const lowercaseQuery = query.toLowerCase();
    
    return nodes.reduce((filteredNodes: ServerNode[], node) => {
      // Check if current node matches
      const nodeMatches = 
        node.displayName.toLowerCase().includes(lowercaseQuery) ||
        node.nodeId.toLowerCase().includes(lowercaseQuery) ||
        node.nodeClass.toLowerCase().includes(lowercaseQuery) ||
        (node.description && node.description.toLowerCase().includes(lowercaseQuery));
      
      // Filter children recursively
      const filteredChildren = node.children ? filterNodes(node.children, query) : [];
      
      if (nodeMatches || filteredChildren.length > 0) {
        // Clone the node with filtered children
        filteredNodes.push({
          ...node,
          children: filteredChildren.length > 0 ? filteredChildren : node.children
        });
      }
      
      return filteredNodes;
    }, []);
  }, []);
  
  const filteredNodes = useMemo(() => {
    return filterNodes(nodes, searchQuery);
  }, [nodes, searchQuery, filterNodes]);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  // Count total nodes including children
  const countTotalNodes = (nodes: ServerNode[]): number => {
    return nodes.reduce((count, node) => {
      return count + 1 + (node.children ? countTotalNodes(node.children) : 0);
    }, 0);
  };
  
  const totalNodesCount = useMemo(() => countTotalNodes(nodes), [nodes]);
  const filteredNodesCount = useMemo(() => countTotalNodes(filteredNodes), [filteredNodes]);
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold dark:text-white flex items-center gap-2">
          <Folder className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
          {serverName} - Object Model
        </h2>
        <div className="text-xs text-gray-500 dark:text-gray-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
          {totalNodesCount} {totalNodesCount === 1 ? 'node' : 'nodes'} total
        </div>
      </div>
      
      <div className="mb-3">
        <SearchInput 
          onSearch={handleSearch} 
          placeholder="Search nodes by name, ID, or type..." 
        />
      </div>
      
      <div className="border rounded-md p-4 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 shadow-sm">
        {searchQuery && filteredNodes.length === 0 ? (
          <div className="text-center py-10">
            <Search className="h-10 w-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No nodes match your search</p>
          </div>
        ) : filteredNodes.length === 0 ? (
          <div className="text-center py-10">
            <File className="h-10 w-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No nodes found in this server</p>
          </div>
        ) : (
          <>
            {searchQuery && (
              <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Found {filteredNodesCount} {filteredNodesCount === 1 ? 'node' : 'nodes'} matching "{searchQuery}"
              </div>
            )}
            <div className="space-y-1">
              {filteredNodes.map((node) => (
                <TreeNode 
                  key={node.nodeId} 
                  node={node} 
                  level={0}
                  isSearching={!!searchQuery} 
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

interface TreeNodeProps {
  node: ServerNode
  level: number
  isSearching?: boolean
}

function TreeNode({ node, level, isSearching = false }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(isSearching)
  const hasChildren = node.children && node.children.length > 0
  
  // Determine icon and color based on node class
  const getNodeIcon = () => {
    if (node.nodeClass === 'Variable') {
      return <File className="h-4 w-4 text-blue-500 dark:text-blue-400" />
    } else if (node.nodeClass === 'Object') {
      return <Folder className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
    } else {
      // For other node classes
      return <Folder className="h-4 w-4 text-purple-500 dark:text-purple-400" />
    }
  }
  
  return (
    <div>
      <div 
        className={`flex items-center py-1.5 px-2 rounded transition-colors
                   hover:bg-slate-100 dark:hover:bg-slate-800
                   ${level === 0 ? 'font-medium' : ''}
                   ${hasChildren ? 'cursor-pointer' : ''}`}
        style={{ paddingLeft: `${level * 16 + 4}px` }}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="p-1 rounded transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 mr-1"
          >
            {isExpanded ? 
              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" /> : 
              <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            }
          </button>
        ) : (
          <span className="w-6 mr-1">
            {getNodeIcon()}
          </span>
        )}
        
        <span 
          className="truncate font-medium dark:text-gray-200" 
          title={`${node.displayName} (${node.nodeId})`}
        >
          {node.displayName}
        </span>
        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
          {node.nodeClass}
        </span>
        {node.description && (
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 italic max-w-[200px] truncate">
            - {node.description}
          </span>
        )}
      </div>
      
      {isExpanded && node.children && (
        <div>
          {node.children.map((childNode) => (
            <TreeNode 
              key={childNode.nodeId} 
              node={childNode} 
              level={level + 1}
              isSearching={isSearching}
            />
          ))}
        </div>
      )}
    </div>
  )
}
