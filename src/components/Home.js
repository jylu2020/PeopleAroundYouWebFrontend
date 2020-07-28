import React from 'react';
import {
  Tabs,
  Spin,
  Row,
  Col,
  Radio,
} from 'antd';
import { CreatePostButton } from './CreatePostButton';
import { HeartOutlined } from '@ant-design/icons';
import { Gallery } from './Gallery';
import { AroundMap } from './AroundMap';
import {
  GEOLOCATION_OPTIONS,
  POSITION_KEY,
  TOKEN_KEY,
  API_ROOT,
  AUTH_HEADER,
  POST_TYPE_IMAGE,
  POST_TYPE_VIDEO,
  TOPIC_AROUND,
  TOPIC_FACE,
  TOPIC_FOOD,
  TOPIC_EXERCISE
} from '../constants';
import '../styles/Home.css';

const { TabPane } = Tabs;

export class Home extends React.Component {
  state = {
    loadingGeolocation: false,
    loadingPosts: false,
    errorMessage: null,
    posts: [],
    topic: 'around',
    showVideo: true
  }

  onTopicChange = (e) => {
    this.setState({ topic: e.target.value }, this.loadPost);
  }


  getGeolocation() {
    this.setState({
      loadingGeolocation: true,
      errorMessage: null,
    });
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        this.onGeolocationSuccess,
        this.onGeolocationFailure,
        GEOLOCATION_OPTIONS,
      );
    } else {
      this.setState({
        loadingGeolocation: false,
        errorMessage: 'Your browser does not support geolocation.',
      });
    }
  }

  onGeolocationSuccess = (position) => {
    this.setState({
      loadingGeolocation: false,
      errorMessage: null,
    })
    console.log(position);
    const { latitude, longitude } = position.coords;
    localStorage.setItem(POSITION_KEY, JSON.stringify({ latitude, longitude }));
    this.loadPost();
  }

  onGeolocationFailure = () => {
    this.setState({
      loadingGeolocation: false,
      errorMessage: 'Failed to load geolocation.',
    })
  }

  loadPost = (
    position = JSON.parse(localStorage.getItem(POSITION_KEY)),
    range = 20,
  ) => {
    if (this.state.topic === TOPIC_AROUND) {
      this.setState({ showVideo: true });
      this.loadNearbyPost(position, range);
    } else if (this.state.topic === TOPIC_FACE) {
      this.setState({ showVideo: false });
      this.loadFacePost();
    } else if (this.state.topic === TOPIC_FOOD) {
      this.setState({ showVideo: false });
      this.loadFoodPost();
    } else if (this.state.topic === TOPIC_EXERCISE) {
      this.setState({ showVideo: false });
      this.loadExercisePost();
    }
  }

  loadNearbyPost = (
    position = JSON.parse(localStorage.getItem(POSITION_KEY)),
    range = 20,
  ) => {
    this.setState({
      loadingPosts: true,
      errorMessage: null,
    });
    const token = localStorage.getItem(TOKEN_KEY);
    fetch(`${API_ROOT}/search?lat=${position.latitude}&lon=${position.longitude}&range=${range}`, {
      method: 'GET',
      headers: {
        Authorization: `${AUTH_HEADER} ${token}`,
      },
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Failed to load posts.');
    }).then((data) => {
      console.log(data);
      this.setState({
        loadingPosts: false,
        posts: data ? data : [],
      });
    }).catch((error) => {
      this.setState({
        loadingPosts: false,
        errorMessage: error.message,
      });
    });
  }

  loadFacePost = () => {
    this.setState({
      loadingPosts: true,
      errorMessage: null,
    });
    const token = localStorage.getItem(TOKEN_KEY);
    fetch(`${API_ROOT}/cluster?term=face`, {
      method: 'GET',
      headers: {
        Authorization: `${AUTH_HEADER} ${token}`,
      },
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Failed to load posts.');
    }).then((data) => {
      console.log(data);
      this.setState({
        loadingPosts: false,
        posts: data ? data : [],
      });
    }).catch((error) => {
      this.setState({
        loadingPosts: false,
        errorMessage: error.message,
      });
    });
  }

  loadFoodPost = () => {
    this.setState({
      loadingPosts: true,
      errorMessage: null,
    });
    const token = localStorage.getItem(TOKEN_KEY);
    fetch(`${API_ROOT}/cluster?term=food`, {
      method: 'GET',
      headers: {
        Authorization: `${AUTH_HEADER} ${token}`,
      },
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Failed to load posts.');
    }).then((data) => {
      console.log(data);
      this.setState({
        loadingPosts: false,
        posts: data ? data : [],
      });
    }).catch((error) => {
      this.setState({
        loadingPosts: false,
        errorMessage: error.message,
      });
    });
  }

  loadExercisePost = () => {
    this.setState({
      loadingPosts: true,
      errorMessage: null,
    });
    const token = localStorage.getItem(TOKEN_KEY);
    fetch(`${API_ROOT}/cluster?term=exercise`, {
      method: 'GET',
      headers: {
        Authorization: `${AUTH_HEADER} ${token}`,
      },
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Failed to load posts.');
    }).then((data) => {
      console.log(data);
      this.setState({
        loadingPosts: false,
        posts: data ? data : [],
      });
    }).catch((error) => {
      this.setState({
        loadingPosts: false,
        errorMessage: error.message,
      });
    });
  }

  getPosts(type) {
    if (this.state.errorMessage) {
      return <div>{this.state.errorMessage}</div>
    } else if(this.state.loadingGeolocation) {
      return <Spin tip="Loading geolocation..."/>
    } else if (this.state.loadingPosts) {
      return <Spin tip="Loading posts..." />
    } else if (this.state.posts.length > 0) {
      if (type === POST_TYPE_IMAGE) {
        return this.getImagePosts();
      } else if (type === POST_TYPE_VIDEO) {
        return this.getVideoPosts();
      }
    } else {
      return 'No nearby posts.';
    }
  }

  getImagePosts() {
    const images = this.state.posts
      .filter((post) => post.type === POST_TYPE_IMAGE)
      .map((post) => {
        return {
          user: post.user,
          src: post.url,
          thumbnail: post.url,
          caption: post.message,
          thumbnailWidth: 400,
          thumbnailHeight: 300,
        }
      });

    return (<Gallery images={images}/>);
  }

  getVideoPosts() {
    return (
      <Row gutter={30}>
        {
          this.state.posts
            .filter((post) => post.type === POST_TYPE_VIDEO)
            .map((post) => (
              <Col span={6} key={post.url}>
                <video src={post.url} controls={true} className="video-block" />
                <div>{`${post.user}: ${post.message}`}</div>
              </Col>
            ))
        }
      </Row>
    );
  }

  componentDidMount() {
    this.getGeolocation();
  }

  render() {
    // const operations = <CreatePostButton onSuccess={this.loadPost} />;
    return (
      <div>
        <CreatePostButton onSuccess={this.loadPost}/>
        <Radio.Group onChange={this.onTopicChange} value={this.state.topic} className="topic-radio-group">
          <Radio value={TOPIC_AROUND}>Posts Around Me</Radio>
          <Radio value={TOPIC_FACE}>People</Radio>
          <Radio value={TOPIC_FOOD}>Food</Radio>
          <Radio value={TOPIC_EXERCISE}>Exercise</Radio>
        </Radio.Group>
        {/* <Tabs tabBarExtraContent={operations} tabPosition="left" className="main-tabs"> */}
        <Tabs tabPosition="left" className="main-tabs">
          <TabPane 
           tab={
            <span>
              <HeartOutlined />
              Image Posts
            </span>
           }
           key="1">
            {this.getPosts(POST_TYPE_IMAGE)}
          </TabPane>
          <TabPane 
           tab={
            <span>
              <HeartOutlined />
              Map View
            </span>
           } 
           key="2">
            <AroundMap
              googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyD3CEh9DXuyjozqptVB5LA-dN7MxWWkr9s&v=3.exp&libraries=geometry,drawing,places"
              loadingElement={<div style={{ height: `100%` }} />}
              containerElement={<div style={{ height: `600px` }} />}
              mapElement={<div style={{ height: `100%` }} />}
              posts={this.state.posts}
              onChange={this.loadPost}
            />
          </TabPane>
          {this.state.showVideo ? 
            <TabPane 
            tab={
              <span>
                <HeartOutlined />
                Video Posts
              </span>
             }
             key="3">
              {this.getPosts(POST_TYPE_VIDEO)}
            </TabPane>
            :
            <></>
          }
        </Tabs>
      </div>
    );
  }
};
