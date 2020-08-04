import * as React from 'react';
import { getShortName } from '../../libs/messengerLoader';
import { TreeDept } from '../../models/TreeDept';
import { Nodes } from '../../models/Nodes'
import { TreeMember } from '../../models/TreeMember'
import { v4 } from 'uuid';
import { publishApi, subscribe, client } from '@/renderer/libs/stomp';
import MemberComponent from './MemberComponent';
import { Node } from '../../models/Node';

const Store = require('electron-store')
const store = new Store()

interface Props{
    clickDept?: any, // 체크박스 클릭 함수
    clickMember?: any,
    master?: TreeMember,
    oldMembers?: TreeMember[],
    isAllChecked?: boolean,
    dept: Node,
    tempMembers?: TreeMember[],
}

interface State{
    isExpanded : boolean, 
    isChecked: boolean,
    uuid: string,
    childNodes: Nodes[],
    memberIsChecked:boolean,
    nodeList: Node[],
}

class Dept extends React.Component<Props, State>{
    constructor(props: Props){
        super(props);
        this.state = {
            isExpanded: false,
            isChecked: false,
            uuid: v4(),
            childNodes : [],
            memberIsChecked: false,
            nodeList: [],
        }
        this.expandTree = this.expandTree.bind(this);
    }

    componentDidMount(){
        subscribe(client, store.get("username"), this.state.uuid, (obj:any) => {
            let payload = obj.payload;
            console.log(payload)
            if(payload){
                if(payload.Nodes){
                    this.setState({
                        childNodes: payload.Nodes,
                        nodeList: [],
                    })
                    this.state.childNodes.map(node =>
                        this.setState({
                            nodeList: this.state.nodeList.concat([{"name": node.columnText , "id" : node.value, "hasChildren" : node.hasChildren, "isExpanded": false, "status": "select", "type": node.type, parentCode : node.parentCode}])
                        })
                    )
                }
            }
        })
    }

    expandTree = () => {
        this.setState({
            isExpanded : !this.state.isExpanded
        })
        publishApi(client, 'api.organ.tree', store.get("username"), this.state.uuid, {"root": "N", "path": this.props.dept.id})
    }
    
    clickTree = (id) => {
        publishApi(client, 'api.organ.tree', store.get("username"), this.state.uuid, {"root": "N", "path": id}),
        this.setState({
            isChecked: !this.state.isChecked
        }, () => this.props.clickDept(this.props.dept.id, this.state.isChecked, this.state.nodeList))
       
    }
    

    // deleteFromSelected = (e) => {
    //     e.preventDefault()
    //     let newMember : TreeMember[];

    //     this.setState({
    //         isChecked : true
    //     },this.props.click("Member", true, newMember,e))
    // }

    
    render(){
        let nodesComponent;
        if(this.state.nodeList){
            nodesComponent = this.state.nodeList.map(node=>{
                console.log(this.state.nodeList)
                if(node.parentCode == this.props.dept.id && node.type == "dept"){
                   
                    return(
                        <Dept clickDept = {this.props.clickDept} clickMember = {this.props.clickMember}  master = {this.props.master} oldMembers = {this.props.oldMembers} dept = {node} tempMembers = {this.props.tempMembers}/>
                    )
                }
                if(node.parentCode == this.props.dept.id && node.type == "user"){
                    // let m : Node;
                    // m = {
                    //     id: node.value,
                    //     name:node.columnText,
                    //     hasChildren:node.hasChildren,
                    //     parentCode: node.parentCode,
                    //     type: node.type,
                    //     status: "select",
                    //     isExpanded: false,
                    // }
                    return(
                        <MemberComponent clickMember = {this.props.clickMember} master = {this.props.master} member = {node} tempMembers = {this.props.tempMembers} />
                    )   
                }
            })
        }
        const checkboxId = "dept-"+ this.props.dept.id+"object:"+ Math.random()
        var triangleVisibility;
        if(!this.props.dept.hasChildren){
            triangleVisibility = { visibility : "hidden" }
        }
        return(
            <li ng-repeat={this.props.dept.hasChildren ? "node in docInfo.organ" : "node in node.subTree" } ng-class="{selected: isInviteMembers(node) >= 0}" ui-tree-node="" data-collapsed="true" ng-include="'organ_renderer'" className={this.props.dept.hasChildren ? "ng-scope angular-ui-tree-node" : "ng-scope angular-ui-tree-node selected"} expand-on-hover="false">
                <div className="organ_wrapper ng-scope">
                    <span ng-style="node.type === 'dept' &amp;&amp; !node.hasChildren &amp;&amp; {'visibility': 'hidden'}" style = {triangleVisibility}>
                        <input type="checkbox" id={checkboxId} ng-disabled="node.disabled" ng-checked="isInviteMembers(node) >= 0" ng-click="toggleMember(node, $event)" checked = {this.state.isChecked}/>
                        <label htmlFor={checkboxId} data-nodrag="">
                            <i className="icon_checkbox" ng-class="{disabled: node.disabled}" onClick={(e) => this.clickTree(this.props.dept.id)}></i>
                        </label>
                    </span>
                    <span className="wrapmsgr_treeicon ng-scope" data-nodrag="" ng-click="toggleOrgan(this)" ng-if="node.type === 'dept'" ng-style="!node.hasChildren &amp;&amp; {'visibility': 'hidden', 'cursor': 'auto'}" onClick = {(e) => this.expandTree()} style = {triangleVisibility}>
                        <i className="icon_triangle wrapmsgr_collapse" ng-class="{true: 'wrapmsgr_collapse', false: 'wrapmsgr_expand'}[collapsed]"></i>
                    </span>
                    <div wrapmsgr-user-profile="users[node.value] || node.value" user-profile-disabled="node.type === 'dept'" className="ng-isolate-scope">
                        <span className="user-photo ng-binding ng-isolate-scope group no-photo green">{getShortName(this.props.dept.name)}</span>
                        <span className="wrapmsgr_member ng-binding">{this.props.dept.name}</span>
                    </div>
                    <ol ui-tree-nodes="" ng-model="node.subTree" ng-class="{expanded: !collapsed}"  className={this.state.isExpanded ? "ng-pristine ng-untouched ng-valid ng-scope angular-ui-tree-nodes ng-not-empty expanded": "ng-pristine ng-untouched ng-valid ng-scope angular-ui-tree-nodes ng-not-empty"} >
                        { nodesComponent }
                    </ol>
                </div>
            </li>
        )
    }
}

export default Dept;


