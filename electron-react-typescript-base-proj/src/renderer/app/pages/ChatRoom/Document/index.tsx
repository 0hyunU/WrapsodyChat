import * as React from 'react';
import { MsgList, MsgInput, Header, MemberList, InfoHeader, SearchBar } from '../../../components';
import { HeaderType, MemberListType, RoomType, InfoHeaderType } from '../../../../libs/enum-type';
import { Message} from '../../../../models/Message';
import { Member } from '../../../../models/Member';
import { Conversation } from '../../../../models/Conversation';
import { Client } from '@stomp/stompjs'
import { subscribe, publishApi, publishChat, client } from '@/renderer/libs/stomp';
import { v4 } from 'uuid';

interface RoomProps {
    convoId: string,
}

interface RoomState {
    client: Client;
    convoId: string;
    uuid: string;
    msgs: Message[];
    members: Member[];
    convo: Conversation;
}

class DocumentChatRoom extends React.Component<RoomProps, RoomState> {
    
    sendMsg(msg: Message) {
        console.log(msg);
        console.log('=============')
        publishChat(client, 'chat.short.convo', this.state.uuid, msg);

        this.setState({
            msgs: this.state.msgs.concat(msg) 
        });

        console.log(this.state.msgs)
    }

    constructor(props: RoomProps, state: {}) {
        super(props, state);
        
        this.state = ({
            client : client,
            convoId : props.convoId,
            uuid : v4(),
            msgs : [],
            members : [],
            convo : {
                convoId:props.convoId, convoType:0, roomType:0, name:'',
                readAt:0, unread:0, memberCount:0, notificationType:0,
                latestMessage: '', latestMessageAt: 0, createdAt: 0 , updatedAt: 0 
            }
        })

        console.log(this.state.convoId)
    }

    componentDidMount() {

        client.onConnect = () => {
            console.log("connected to Stomp");
        subscribe(client, 'admin', this.state.uuid, (payload: any) => {
            if (payload) {
                console.log(window.location.href)
                console.log('+++++++++++++++++++')
                console.log(payload)
                console.log('+++++++++++++++++++')
                if (payload.Messages) {
                    this.setState({
                        msgs: payload.Messages
                    })
                }

                if (payload.Members) {
                    this.setState({
                        members: payload.Members
                })
                }
                if (payload.Conversation) {
                    this.setState({
                        convo: payload.Conversation
                    })
                }
                }
            }
        );
        publishApi(client, 'api.user.info', 'admin', this.state.uuid, {});
        publishApi(client, 'api.message.list', 'admin', this.state.uuid, { 'convoId': this.props.convoId, "direction": "forward" });
        publishApi(client, 'api.conversation.view', 'admin', this.state.uuid, { 'convoId': this.props.convoId });
        }

        client.activate()
    }

    render() {
        let sendMsg = this.sendMsg;
        // console.log('++++++++++=')
        console.log(this.state)
        return (
            <React.Fragment>
                <div id="wrapmsgr" className="ng-scope">
                    <div id="wrapmsgr_body" ng-controller="WrapMsgrController" className="wrapmsgr_container ng-scope" data-ws="ws://ecm.dev.fasoo.com:9500/ws" data-vhost="/wrapsody-oracle" data-fpns-enabled="true" data-weboffice-enabled="true">
                        <div className="wrapmsgr_chat wrapmsgr_state_normalize wrapmsgr_viewmode_full" ng-class="[chatroomState, viewModeClass, {false: 'disabled'}[loggedIn]]" ng-show="current.convo">
                            <Header convoId = {this.props.convoId} docName = {this.state.convo.name} headerType = {HeaderType.CHAT} />
                            <div className="wrapmsgr_content  wrapmsgr_viewmode_full doc-chatroom" ng-class="[{1: 'doc-chatroom', 2: 'wrapmsgr_chatbot'}[current.convo.convoType], viewModeClass]">     
                                <InfoHeader docName = {this.state.convo.name} memberCount = {this.state.convo.memberCount} infoheaderType = {InfoHeaderType.DOC} />
                                <div className="wrapmsgr_aside" ng-hide="viewMode == 'chat' || current.convo.convoType == 2">
                                    <SearchBar/>
                                    <MemberList convoId = {this.props.convoId} memberListType = {MemberListType.CHAT} members = {this.state.members}/>
                                </div>   
                                <div className="wrapmsgr_article wrapmsgr_viewmode_full" ng-class="viewModeClass" id="DocumentChat">
                                    <MsgList msgs={this.state.msgs}/>
                                    <MsgInput convoId={this.props.convoId} uuid={this.state.uuid} sendMsg = {sendMsg.bind(this)}/>
                                </div>       
                            </div>
                        </div>
                    </div>
                </div>    
               
            </React.Fragment>
        )
    } 
}

export default DocumentChatRoom;