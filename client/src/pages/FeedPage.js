import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col } from "../components/Grid/Grid";
import AlliesBar from "../components/AlliesBar/AlliesBar";
import Feed from "../components/Feed/Feed";
import PostForm from "../components/PostForm/PostForm";
import Nav from "../components/Nav/Nav";
import API from "../utils/API";
import Header from "../components/Header/Header";
import { AuthContext } from '../context/AuthContext';
import { Redirect } from 'react-router';



const FeedPage = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const [feed, setFeed] = useState([]);
    const [feedLoading, setFeedLoading] = useState(false)

    useEffect(() => {
        setFeedLoading(true)
        API.getAllyList({ userName: sessionStorage.getItem('project3username') })
            .then(data => {
                API.getFeedPosts({
                    friendList: data.data,
                    userName: sessionStorage.getItem('project3username')
                })
                    .then(data => {
                        setFeed(data.data)
                        setFeedLoading(false)
                    })
                    .catch(err => console.log(err))
            })
            .catch(err => console.log(err))
    }, [])

    const reloadPosts = () => {
        API.getAllyList({ userName: sessionStorage.getItem('project3username') })
            .then(data => {
                API.getFeedPosts({
                    friendList: data.data,
                    userName: sessionStorage.getItem('project3username')
                })
                    .then(data => setFeed(data.data))
                    .catch(err => console.log(err))
            })
            .catch(err => console.log(err))
    }

    if (!isAuthenticated) {
        return <Redirect to='/log-in' />
    }

    return (
        <>
            <Nav />
            <main>
                <Container className="mt-4">
                    <Row>
                        <div className="col-sm-12 col-md-7 offset-md-1">
                            <Header headerText="Info Board" display={false} />
                            {feedLoading ?
                                null
                                :
                                <PostForm reloadPosts={reloadPosts} />
                            }
                            {feed.length > 0 && !feedLoading ?
                                <Feed feed={feed} name={sessionStorage.getItem('project3username')} /> :
                                null
                            }
                            {feed.length === 0 && !feedLoading ?
                                <h3>You have no feed yet.</h3> :
                                null
                            }
                        </div>
                        <div className="col-sm-12 col-md-3">
                            <div className="card-header allies-header"><i className="fa fa-users"></i> Allies</div>
                            <AlliesBar />
                        </div>
                    </Row>
                </Container>
            </main>
        </>
    )
}

export default FeedPage;

