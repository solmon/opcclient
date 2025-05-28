import { useState, useMemo, useCallback } from 'react'
import { ServerNode } from '@/types/server'
import { ChevronRight, ChevronDown, File, Folder, Database, Search, RefreshCw } from 'lucide-react'
import { SearchInput } from '@/components/search-input'
import { OPCServerManager } from '@/lib/opc-server-manager'
import { toast } from 'react-toastify'

interface ObjectModelTreeProps {
  nodes: ServerNode[]
  serverName: string
  serverId: string
  opcServerManager: OPCServerManager
}

export function ObjectModelTree({ nodes, serverName, serverId, opcServerManager }: ObjectModelTreeProps) {
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
                  serverId={serverId}
                  opcServerManager={opcServerManager}
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
  serverId: string
  opcServerManager: OPCServerManager
}

function TreeNode({ node, level, isSearching = false, serverId, opcServerManager }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(isSearching)
  const [isLoading, setIsLoading] = useState(false)
  const [children, setChildren] = useState<ServerNode[]>(node.children || [])
  const [hasLoadedChildren, setHasLoadedChildren] = useState(false)
  
  // Check if node might have children (for lazy loading)
  const mightHaveChildren = 
    (node.children && node.children.length > 0) || // Has loaded children
    (!hasLoadedChildren && (node.nodeClass === 'Object' || node.nodeClass === 'ObjectType' || node.nodeClass === 'Folder'));

  // Handle node expansion with lazy loading
  const handleExpand = async () => {
    // Toggle expansion
    const willExpand = !isExpanded;
    setIsExpanded(willExpand);
    
    // If expanding and children haven't been loaded yet, load them
    if (willExpand && !hasLoadedChildren && children.length === 0) {
      setIsLoading(true);
      
      try {
        // Load children from the server
        const loadedChildren = await opcServerManager.browseNode(serverId, node.nodeId);
        setChildren(loadedChildren);
        setHasLoadedChildren(true);
      } catch (error) {
        console.error(`Error loading children for node ${node.nodeId}:`, error);
        toast.error(`Failed to load child nodes: ${(error as Error).message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
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
                   ${mightHaveChildren ? 'cursor-pointer' : ''}`}
        style={{ paddingLeft: `${level * 16 + 4}px` }}
        onClick={() => mightHaveChildren && handleExpand()}
      >
        {mightHaveChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleExpand()
            }}
            className="p-1 rounded transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 mr-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 text-gray-500 dark:text-gray-400 animate-spin" />
            ) : isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            )}
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
      
      {isExpanded && (
        <div>
          {isLoading && children.length === 0 ? (
            <div 
              className="flex items-center py-1.5 px-2 text-gray-500 dark:text-gray-400 text-sm italic"
              style={{ paddingLeft: `${(level + 1) * 16 + 4}px` }}
            >
              Loading...
            </div>
          ) : children.length > 0 ? (
            children.map((childNode) => (
              <TreeNode 
                key={childNode.nodeId} 
                node={childNode} 
                level={level + 1}
                isSearching={isSearching}
                serverId={serverId}
                opcServerManager={opcServerManager}
              />
            ))
          ) : hasLoadedChildren ? (
            <div 
              className="flex items-center py-1.5 px-2 text-gray-500 dark:text-gray-400 text-sm italic"
              style={{ paddingLeft: `${(level + 1) * 16 + 4}px` }}
            >
              No child nodes
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
