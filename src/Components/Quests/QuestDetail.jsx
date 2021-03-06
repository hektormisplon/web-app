import React, { Component } from 'react';
import { firestore, auth } from '../../Utils/Firebase';
import Spinner from '../../Shared/Spinner';
import styled from 'styled-components';
import QuestMap from './QuestMap'
import *  as routes from '../../routes/routes'

const Loading = () => <div> <Spinner /> </div>

const Title = styled.h1`
`

const Table = styled.table`
    margin : 20px;
    @media all and (max-width:1000px){
        width : 95%;
    }
`

const TableParticipants = styled(Table)`
    margin : 0;
    margin-top : 3%;
    width : 90%;
    border-collapse : collapse;
`

const Tr = styled.tr`
    @media all and (max-width:1000px){
        display : block;
        margin-bottom : 30px;
    }
`

const Td = styled.td`
    border : ${props => props.withBorder ? '1px solid #ddd' : '0'};
    width : 50vw;
    text-align : ${props => props.alignCenter ? 'center' : 'left'};
    vertical-align : top;
    
    @media all and (max-width:1000px){
        display : block;
        width:95%;
    }
`

const TdParticipants = styled(Td)`
    padding : 5px;
    text-align : ${props => props.alignCenter ? 'center' : 'left'};
    color : ${props => props.green ? "hsl(141,71%,48%)" : props.red ? "hsl(348,100%,61%)" : "black"}; 
`

const Th = styled.th`
    border : ${props => props.withBorder ? '1px solid #ddd' : '0'};
    width : 50%;
    text-align : ${props => props.alignCenter ? 'center' : 'left'};
    vertical-align : top;
    background : #00AACC;
    color : white;
    padding : 10px;

    @media all and (max-width:1000px){
        display : block;
        width:95%;
    }
`

const Description = styled.p`
    font-size : 16px;
    line-height: 150%;
    width: 95%;
    margin-top: 50px;
`

const Button = styled.button`
    background : ${props => props.primary ? '#fbc531' : '#e74c3c'};
    color : white;
    font-size: 20px;
    margin-top : 1%;
    margin-right: 2%;
    margin-bottom : 1%;
    padding: 0.25em 1em;
    border: 2px solid #bdc3c7;
    border-radius: 3px;  
    cursor : pointer;
    font-weight : bold;

    @media all and (max-width:1000px){
        margin-bottom : 5%;
        margin-top : 0;
    }
`

const ButtonRegister = styled(Button)`
    background : #A3CB38;
    font-size : 18px;
    border-radius : 7px;
`

const TextAccept = 'accept';
const TextDecline = 'decline';

class QuestDetail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            questItem: null,
            loading: true,
            isAuthUserQuest : false,
            activeUser : null,
            activeParticipants : [],
            currentParticipant : null,
            mapProperties: {
                marker: null,
                zoom: null,
                center: []
            }
        }

        this.handleClose = this.handleClose.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.getActiveParticipants = this.getActiveParticipants.bind(this);
        this.getCurrentParticipant = this.getCurrentParticipant.bind(this);
        this.registerToQuest = this.registerToQuest.bind(this);
    }

    handleClick(req, item) {
        switch(req) {
            case TextAccept:
                console.log(`Accept : ${item.id}`);
                firestore.updateParticipant(item.id, true);
                this.setState({currentParticipant : item});
                break;
            case TextDecline:
                console.log(`Decline : ${item.questId}`);
                break;
            default:
                console.log("'accept'|'decline' only.");
                break;
        }
    }

    getActiveParticipants(id) {
        let activeParticipants = [];
        firestore.onceGetWaitingParticipantsQuest(id)
                 .then(snapshot => {
                     snapshot.forEach(doc => {
                         if (doc.data()){
                            let data = doc.data()
                            data["id"] = doc.id;
                            activeParticipants.push(data);
                         }
                     })

                     this.setState( () => ({activeParticipants}))
                 })
                 .catch( err => {
                     this.setState( () => ({activeParticipants : []}))
                     console.log("Error gettings waiting participants : ", err)
                 })
    }

    getCurrentParticipant(id){
        let currentParticipant = null;
        firestore.onceGetCurrentParticipant(id)
                 .then(snapshot => {
                     if (snapshot.size === 1) {
                         snapshot.forEach(doc => {
                             currentParticipant = doc.data();
                         })
                     } 

                     this.setState( () => ({currentParticipant}));
                 })
                 .catch( err => {
                    this.setState( () => ({currentParticipant : null}))
                    console.log("Error gettings waiting participants : ", err)
                })
    }

    async registerToQuest(){
        const {id} = this.props.match.params;
        const {activeUser} = this.state;
        let userId = auth.getUserId();

        await firestore.createNewQuestTakers({
            isDoingQuest : false,
            participantEmail : activeUser.email,
            participantId : userId,
            participantName : activeUser.name,
            participatedOn : new Date(),
            questId : id
        })

        window.location.reload();

    }

    setupMapProperties(quest) {
        let center = [quest.latitude, quest.longitude];
        let pin = quest.pinImage;
        let latlng = { lat: center[0], lng: center[1] };
        const zoom = 16;
        let marker = {
            latlng,
            pin,
            quest
        }
        return {
            marker,
            zoom,
            center
        }
    }

    async handleClose(event) {
        event.preventDefault();
        let {questItem} = this.state;
        if (!!this.state.questItem) {
            await firestore.closeQuest(questItem.id);
            window.open("../quests", "_self");
        }
    }

    handleEdit(event) {
        event.preventDefault();
        let { questItem } = this.state;
        window.open(routes.EditQuest + "/" + questItem.id, "_self");
    }

    componentDidMount() {
        window.scrollTo(0, 0);
        const { id } = this.props.match.params;
        const authUserId = auth.getUserId();

        if (authUserId !== "") {
            firestore.onceGetParticipant(auth.getUserId())
            .then(doc => {
                this.setState(() => ({activeUser : doc.data()}))
            })
            .catch(err => {
                this.setState(() => ({activeUser : null}));
                console.log("Error getting active user : ", err);
            })
            
        }

        firestore.onceGetQuest(id)
            .then((doc) => {
                let questItem = doc.data();
                questItem.id = doc.id;
                questItem.pinImage = 'https://firebasestorage.googleapis.com/v0/b/gentle-student.appspot.com/o/Quests%2Fquest_pin.png?alt=media';

                let mapProperties = this.setupMapProperties(questItem);
                let sameIdQuest = (questItem.questGiverId.trim() === authUserId.trim() && questItem.questStatus !== 2);
                this.setState(() => ({ questItem, loading: false, mapProperties, isAuthUserQuest: sameIdQuest }));
            })
            .catch(err => {
                this.setState(() => ({ questItem: null, loading: true }));
                console.log("Error getting quest : ", err);
            })
        
        this.getActiveParticipants(id);
        this.getCurrentParticipant(id);
    }

    render() {
        const { loading, questItem, mapProperties, isAuthUserQuest, activeParticipants, currentParticipant, activeUser } = this.state;
        const { zoom, center, marker } = mapProperties;
        const markers = [marker];

        return (
            <>
                {loading && <Loading />}
                {!loading &&
                    <Table>
                        <tbody>
                            <Tr>
                                <Td>
                                    <Title> {questItem.title} </Title>
                                    <table className="quest-info">
                                        <tr>
                                        <th>Aangemaakt op:</th>
                                        <td>{questItem.created.toDate().toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                        <th>E-mail:</th>
                                        <td>{questItem.emailAddress}</td>
                                        </tr>
                                        <tr>
                                        <th>GSM-nr:</th>
                                        <td>{questItem.phoneNumber}</td>
                                        </tr>
                                     </table>
                            
                                    <Description> {questItem.description} </Description>

                                    { !isAuthUserQuest && activeUser && !activeParticipants.map(x => x.participantEmail).includes(activeUser.email) &&
                                        <ButtonRegister onClick={this.registerToQuest}> Registreer </ButtonRegister>
                                    }

                                    {
                                        !!isAuthUserQuest &&
                                        <div>
                                            <Button primary onClick={this.handleEdit}> Edit </Button>
                                            <Button onClick={this.handleClose}> Close </Button>
                                            <br /> <hr />
                                        </div>
                                    }
                                    
                                    {
                                        !! isAuthUserQuest && activeParticipants.length === 0 &&
                                        <h2> List of participants is empty ... </h2>
                                    }

                                    {
                                        !!isAuthUserQuest && activeParticipants.length > 0 &&
                                        <div>
                                            <TableParticipants>
                                                <thead>
                                                { !!currentParticipant &&
                                                    <tr>
                                                        <Th withBorder> Participant name </Th>
                                                        <Th withBorder> Participated on </Th>
                                                    </tr>
                                                }
                                                { !currentParticipant && 
                                                    <tr>
                                                        <Th withBorder> Participant name </Th>
                                                        <Th withBorder> Participated on</Th>
                                                        <Th withBorder> Accept </Th>
                                                        <Th withBorder> Decline </Th>
                                                    </tr>
                                                }
                                                </thead>

                                                <tbody>

                                                    {!!currentParticipant && 
                                                        <tr>
                                                            <TdParticipants withBorder> {currentParticipant.participantName} </TdParticipants>
                                                            <TdParticipants withBorder> {currentParticipant.participatedOn.toDate().toLocaleString()} </TdParticipants>
                                                        </tr>

                                                    }

                                                    {!currentParticipant && activeParticipants.map(item => 
                                                        <tr key={item.id}>
                                                            <TdParticipants withBorder> {item.participantName} </TdParticipants>
                                                            <TdParticipants withBorder> {item.participatedOn.toDate().toLocaleString()} </TdParticipants>
                                                            <TdParticipants withBorder alignCenter green>
                                                                <i onClick={
                                                                    () => this.handleClick(TextAccept, item)
                                                                } className="fas fa-lg fa-check-square" style={{cursor : "pointer"}}></i>
                                                            </TdParticipants>
                                                            <TdParticipants withBorder alignCenter red grab>
                                                                <i onClick={
                                                                    () => this.handleClick(TextDecline, item)
                                                                } className="fas fa-lg fa-ban" style={{cursor : "pointer"}}></i>
                                                            </TdParticipants>
                                                        </tr>
                                                    )}
                                                </tbody>

                                            </TableParticipants>
                                        </div>
                                    }
                                    

                                </Td>

                                <Td>
                                    <QuestMap center={center} zoom={zoom} markers={markers} disableClick={true} disablePopup={true} />
                                </Td>
                            </Tr>
                        </tbody>
                    </Table>
                }
            </>
        )
    }
}

export default QuestDetail;