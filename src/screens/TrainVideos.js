import React, { useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, TextInput, TouchableOpacity, Modal, Image, Dimensions, Alert, SafeAreaView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const videos = [
  { id: '1', category: 'Basic Commands', title: 'Sit', duration: '3:03', thumbnail: 'https://img.youtube.com/vi/qExwIfed7jg/0.jpg', url: 'https://www.youtube.com/embed/qExwIfed7jg' },
  { id: '2', category: 'Basic Commands', title: 'Stay', duration: '4:14', thumbnail: 'https://img.youtube.com/vi/RndMTsZTpMo/0.jpg', url: 'https://www.youtube.com/embed/RndMTsZTpMo' },
  { id: '3', category: 'Behavioral Training', title: 'Barking', duration: '3:53', thumbnail: 'https://img.youtube.com/vi/pZkzdsjtWc0/0.jpg', url: 'https://www.youtube.com/embed/pZkzdsjtWc0' },
  { id: '4', category: 'Behavioral Training', title: 'Chewing', duration: '5:00', thumbnail: 'https://img.youtube.com/vi/CZuo57SbFJc/0.jpg', url: 'https://www.youtube.com/embed/CZuo57SbFJc' },
  { id: '5', category: 'Advanced Training', title: 'Heel', duration: '6:05', thumbnail: 'https://img.youtube.com/vi/Eh3vvSbbGd0/0.jpg', url: 'https://www.youtube.com/embed/Eh3vvSbbGd0' },
  { id: '6', category: 'Advanced Training', title: 'Recall', duration: '4:35', thumbnail: 'https://img.youtube.com/vi/aptya2T2_3M/0.jpg', url: 'https://www.youtube.com/embed/aptya2T2_3M' },
];

const TrainVideos = ({ navigation }) => {
  const [savedVideos, setSavedVideos] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');

  const handlePlay = (url) => {
    setCurrentVideoUrl(url);
    setModalVisible(true);
  };

  const handleSave = (id) => {
    if (!savedVideos.includes(id)) {
      setSavedVideos([...savedVideos, id]);
    }
  };

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchText.toLowerCase()) ||
    video.category.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderVideoItem = ({ item }) => (
    <View style={styles.videoContainer}>
      <TouchableOpacity onPress={() => handlePlay(item.url)} style={styles.touchable}>
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        <View style={styles.videoDetails}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.duration}>{item.duration}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleSave(item.id)}>
        <Text style={styles.saveForLater}>Save for Later</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerWrapper}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>TechPup Training Platform</Text>
        </View>
      </View>
      <Text style={styles.subHeader}>Stay up to date with the latest TechPup videos.</Text>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color="#aaa" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search All Posts"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      <Text style={styles.latestPostsHeader}>Latest Posts</Text>
      <FlatList
        data={filteredVideos}
        renderItem={renderVideoItem}
        keyExtractor={(video) => video.id}
        contentContainerStyle={styles.listContent}
      />
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.webviewWrapper}>
            <WebView
              source={{ uri: currentVideoUrl }}
              style={styles.webview}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          </View>
          <Button title="Close" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => Alert.alert('Chat', 'This feature will come out soon!')}
      >
        <Ionicons name="chatbubbles" size={24} color="white" />
        <Text style={styles.chatButtonText}>Chat</Text>
      </TouchableOpacity>
      <View style={styles.bottomContainer}>
        <View style={styles.bottomNavContainer}>
          <TouchableOpacity style={styles.bottomNavButton} onPress={() => navigation.navigate('Home')}>
            <FontAwesome5 name="dog" size={24} color="#aaa" />
            <Text style={styles.bottomNavText}>My Dog</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomNavButton} onPress={() => navigation.navigate('TrainVideos')}>
            <FontAwesome5 name="video" size={24} color="#0097A7" />
            <Text style={[styles.bottomNavText, styles.activeNavText]}>TechPup</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomNavButton} onPress={() => Alert.alert('Feature Coming Soon', 'Friends feature is coming soon!')}>
            <FontAwesome5 name="bone" size={24} color="#aaa" style={{ transform: [{ rotate: '45deg' }] }} />
            <Text style={styles.bottomNavText}>Friends</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomNavButton} onPress={() => navigation.navigate('Profile')}>
            <FontAwesome5 name="user" solid size={24} color="#aaa" />
            <Text style={styles.bottomNavText}>Me</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerWrapper: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Dimensions.get('window').height * 0.05,
    paddingBottom: 10,
  },
  headerContainer: {
    backgroundColor: '#0097A7',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  subHeader: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    height: 40,
    flex: 1,
  },
  latestPostsHeader: {
    fontSize: 18,
    marginBottom: 16,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 16,
  },
  videoContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  touchable: {
    flexDirection: 'row',
    flex: 1,
  },
  thumbnail: {
    width: 100,
    height: 100,
    marginRight: 16,
    borderRadius: 8,
  },
  videoDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  duration: {
    fontSize: 14,
    marginBottom: 8,
    color: '#6c757d',
  },
  saveForLater: {
    color: '#0097A7',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 80, // Ensure padding to prevent overlap with the bottom navigation bar
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  webviewWrapper: {
    width: Dimensions.get('window').width * 0.9,
    height: Dimensions.get('window').height * 0.5,
    overflow: 'hidden',
    borderRadius: 10,
  },
  webview: {
    width: '100%',
    height: '100%',
  },
  chatButton: {
    position: 'absolute',
    bottom: 90,
    right: 16,
    backgroundColor: '#0097A7',
    padding: 16,
    borderRadius: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bottomContainer: {
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  bottomNavContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 10,
    height: 60,
  },
  bottomNavButton: {
    alignItems: 'center',
  },
  bottomNavText: {
    fontSize: 12,
    color: '#aaa',
  },
  activeNavText: {
    color: '#0097A7',
    fontWeight: 'bold',
  },
});

export default TrainVideos;
