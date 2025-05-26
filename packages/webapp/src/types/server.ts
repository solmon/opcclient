export interface Server {
  id: string
  name: string
  endpointUrl: string
  useAnonymous?: boolean
  username?: string
  password?: string
}

export interface ServerNode {
  nodeId: string
  browseName: string
  displayName: string
  description?: string
  nodeClass: string
  children?: ServerNode[]
}

export interface ServerObjectModel {
  serverId: string
  serverName: string
  rootNodes: ServerNode[]
}
