import * as React from 'react';
import { Member } from '../../models/Member';
import { getShortName } from '../../libs/messengerLoader';
import { TreeMember } from '../../models/TreeMember';
import { TreeDept } from '../../models/TreeDept';
import { client , subscribe, publishApi } from '../../libs/stomp'
import { MemberComponent, Dept } from '../components'
import { Nodes } from '../../models/Nodes';
import { Node } from '../../models/Node';
import store from '../../../store';

interface Group {
    longName: string;
    shortName: string;
}

interface Props {
    memberListType: string;
    convoId?: string;
    search?:string;
    members?: Member[];
    treeData?: any;
    clickMember?: any;
    clickDept? : any;
    viewAuthAllUsers?: boolean;
    oldMembers?: TreeMember[];
    master?: TreeMember;
    isAllChecked?: boolean,
    isMemberChecked?: boolean,
    isDeptChecked?: boolean,
    childNodes?: any,
    nodeList?: Node[],
    // tempMembers?: TreeMember[],
}

interface State{
    tempMembers : TreeMember[]
}


class MemberList extends React.Component<Props, State>{
    constructor(props: Props) {
        super(props);
        this.state = {
            tempMembers: store.getState().tempMembers
        }
        store.subscribe(function(this:MemberList){
            this.setState({ tempMembers: store.getState().tempMembers });
        }.bind(this));
    }
    render() {
        
        const { memberListType, convoId} = this.props
        let tempMembersComponent;
        if(this.state.tempMembers && this.state.tempMembers.length > 0){
            tempMembersComponent = this.state.tempMembers.map(member=> {
                return(
                    <MemberComponent tempMember = {member} clickMember = {this.props.clickMember} selectedMemberType = {"tempMembers"}/>
                )
            })
        }
        if (memberListType == 'chat' || this.props.members) {
            return (
                <ul id="forMemberList">
                    {this.props.members.map(member => 
                    {
                        if(member.userName && (this.props.search === null || member.userName.toLowerCase().includes(this.props.search.toLowerCase()) || member.userId.toLowerCase().includes(this.props.search.toLowerCase()))) {
                        return(<li id={member.userId} ng-repeat="member in current.members | memberFilter:search.user:users | orderBy:'userName'" ng-class="{'has-grn-dot': false, 'has-red-dot': false}" wrapmsgr-user-profile="users[member.userId]" className="ng-scope ng-isolate-scope">
                            <span className="user-photo ng-binding ng-isolate-scope no-photo green">{getShortName(member.userName)}</span>
                            <div className="ng-binding">{member.userName} ({member.userId})</div>
                            <div className="sub-info ng-binding">dept1</div>
                        </li>)
                        }
                    })}
                </ul>
            );
        } else if (memberListType == 'select') {
            return (
                <React.Fragment>
                    <div className="wrapmsgr_organ_tree_header">
                        <input type="checkbox" id="manage_doc_room_select_all" ng-disabled="!loggedIn || organTreeOptions.disabled" ng-checked="checkAllMembers()" ng-click="toggleAllMembers($event)" checked = {this.props.isAllChecked}/>
                        <label htmlFor="manage_doc_room_select_all">
                            <i className="icon_checkbox" ng-class="{disabled: organTreeOptions.disabled}"></i>
                        </label>
                        <span>Select All</span>
                    </div>
                    <ol ui-tree-nodes="" ng-model="docInfo.organ" ng-show="docInfo.organ.length > 0" className="ng-pristine ng-untouched ng-valid ng-scope angular-ui-tree-nodes ng-not-empty">  
                        {
                            this.props.nodeList.map(node=>{
                                if(node.type == "user" && node.status == "select"){
                                    return(
                                        <MemberComponent clickMember = {this.props.clickMember} master = {this.props.master} member = {node} oldMembers = {this.props.oldMembers}/>
                                    )
                                }else if(node.type == "dept" && node.status == "select"){
                                    return(
                                        <Dept clickDept = {this.props.clickDept} clickMember = {this.props.clickMember} master = {this.props.master} oldMembers = {this.props.oldMembers} dept = {node}/>
                                    )
                                }
                            })
                        }
                    </ol>
                </React.Fragment>
            );
        } else if (memberListType == 'selected') {
            return (
                <ol ui-tree-nodes="" ng-model="inviteMembers" ng-show="inviteMembers.length > 0" className="ng-pristine ng-untouched ng-valid ng-scope angular-ui-tree-nodes ng-not-empty">
                    {this.props.oldMembers.map(member => 
                    {
                        return(
                           <MemberComponent oldMember = {member} selectedMemberType = {"oldMembers"}/>
                        )
                    })}
                    {tempMembersComponent}
                </ol>
            );
        }
    }
}

export default MemberList;


