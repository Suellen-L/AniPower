// App.js - React Native Mobile App
import React, { useState, useEffect } from 'react';
import * as ReactNative from 'react-native';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, StatusBar, Alert, FlatList, Dimensions, ActivityIndicator } from 'react-native';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'https://anilistmikilior1v1.p.rapidapi.com';
const API_HEADERS = {
  'X-RapidAPI-Key': '06cdd2fb15msh225e37488a3c5e9p1b6111jsn8fb0e3cd543c',
  'X-RapidAPI-Host': 'anilistmikilior1v1.p.rapidapi.com',
  'Content-Type': 'application/json'
};// Para dispositivo físico: 'http://SEU_IP:80/anime_api'

const AnimeApp = () => {
  const [activeTab, setActiveTab] = useState('animes');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [animes, setAnimes] = useState([]);
  const [mangas, setMangas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dados mock para demonstração (substitua pelas chamadas da API)
  const mockAnimes = [
    { id: 1, title: 'Attack on Titan', episodes: 24, year: 2024, season: 'Verão', emoji: '🏛️' },
    { id: 2, title: 'Demon Slayer', episodes: 12, year: 2024, season: 'Verão', emoji: '⚔️' },
    { id: 3, title: 'My Hero Academia', episodes: 25, year: 2024, season: 'Verão', emoji: '🦸' },
    { id: 4, title: 'Jujutsu Kaisen', episodes: 24, year: 2024, season: 'Verão', emoji: '👹' },
    { id: 5, title: 'Chainsaw Man', episodes: 12, year: 2024, season: 'Outono', emoji: '🔗' },
    { id: 6, title: 'Spy x Family', episodes: 12, year: 2024, season: 'Outono', emoji: '🕵️' },
    { id: 7, title: 'Mob Psycho 100', episodes: 12, year: 2024, season: 'Outono', emoji: '👻' },
    { id: 8, title: 'Blue Lock', episodes: 24, year: 2024, season: 'Outono', emoji: '⚽' },
    { id: 9, title: 'Tokyo Revengers', episodes: 24, year: 2024, season: 'Inverno', emoji: '🏍️' },
    { id: 10, title: 'Horimiya', episodes: 13, year: 2024, season: 'Inverno', emoji: '💕' },
    { id: 11, title: 'Dr. Stone', episodes: 11, year: 2024, season: 'Inverno', emoji: '🧪' },
    { id: 12, title: 'The Promised Neverland', episodes: 11, year: 2024, season: 'Inverno', emoji: '🏠' },
    { id: 13, title: 'Kaguya-sama', episodes: 12, year: 2024, season: 'Primavera', emoji: '🎭' },
    { id: 14, title: 'One Punch Man', episodes: 12, year: 2024, season: 'Primavera', emoji: '👊' },
    { id: 15, title: 'Overlord', episodes: 13, year: 2024, season: 'Primavera', emoji: '💀' },
    { id: 16, title: 'Re:Zero', episodes: 25, year: 2024, season: 'Primavera', emoji: '🔄' },
  ];

  const mockMangas = [
    { id: 1, title: 'One Piece', chapters: 1090, status: 'Ongoing', category: 'Ação', emoji: '🏴‍☠️' },
    { id: 2, title: 'Naruto', chapters: 700, status: 'Completed', category: 'Ação', emoji: '🍥' },
    { id: 3, title: 'Dragon Ball', chapters: 519, status: 'Completed', category: 'Ação', emoji: '🐉' },
    { id: 4, title: 'Bleach', chapters: 686, status: 'Completed', category: 'Ação', emoji: '⚔️' },
    { id: 5, title: 'Kaguya-sama', chapters: 281, status: 'Completed', category: 'Romance', emoji: '💕' },
    { id: 6, title: 'Rent-a-Girlfriend', chapters: 300, status: 'Ongoing', category: 'Romance', emoji: '📱' },
    { id: 7, title: 'Toradora!', chapters: 87, status: 'Completed', category: 'Romance', emoji: '🐅' },
    { id: 8, title: 'Nisekoi', chapters: 229, status: 'Completed', category: 'Romance', emoji: '🔑' },
    { id: 9, title: 'Hunter x Hunter', chapters: 400, status: 'Hiatus', category: 'Aventura', emoji: '🎯' },
    { id: 10, title: 'Fairy Tail', chapters: 545, status: 'Completed', category: 'Aventura', emoji: '🧚' },
    { id: 11, title: 'Seven Deadly Sins', chapters: 346, status: 'Completed', category: 'Aventura', emoji: '🗡️' },
    { id: 12, title: 'Black Clover', chapters: 370, status: 'Ongoing', category: 'Aventura', emoji: '🍀' },
    { id: 13, title: 'Yotsuba&!', chapters: 110, status: 'Ongoing', category: 'Slice of Life', emoji: '🌸' },
    { id: 14, title: 'Azumanga Daioh', chapters: 69, status: 'Completed', category: 'Slice of Life', emoji: '🏫' },
    { id: 15, title: 'K-On!', chapters: 57, status: 'Completed', category: 'Slice of Life', emoji: '🎸' },
    { id: 16, title: 'Lucky Star', chapters: 83, status: 'Completed', category: 'Slice of Life', emoji: '⭐' },
  ];

  useEffect(() => {
    loadData();
    loadSearchHistory();
  }, []);

  // Função para carregar dados do backend
  const loadData = async () => {
  setLoading(true);
  try {
    const [animesResponse, mangasResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/anime`, {
        method: 'GET',
        headers: API_HEADERS
      }),
      fetch(`${API_BASE_URL}/manga`, {
        method: 'GET',
        headers: API_HEADERS
      })
    ]);
    

      if (animesResponse.ok && mangasResponse.ok) {
        const animesData = await animesResponse.json();
        const mangasData = await mangasResponse.json();
        setAnimes(animesData);
        setMangas(mangasData);
      } else {
        throw new Error('Failed to fetch data');
      }
      
      
      // Simulação com dados mock
      setTimeout(() => {
        setAnimes(mockAnimes);
        setMangas(mockMangas);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Erro', 'Falha ao carregar dados. Usando dados offline.');
      setAnimes(mockAnimes);
      setMangas(mockMangas);
      setLoading(false);
    }
  };

  // Função para salvar pesquisa no histórico
  const saveSearchHistory = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/search`, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify({
        query: query,
        search_date: new Date().toISOString()
      }),
    });

      if (response.ok) {
        loadSearchHistory();
      }
      
      
      // Simulação para demonstração
      const newHistoryItem = {
        id: Date.now(),
        query: query,
        search_date: new Date().toISOString()
      };
      
      setSearchHistory(prev => {
        const filtered = prev.filter(item => item.query !== query);
        return [newHistoryItem, ...filtered].slice(0, 20);
      });
      
    } catch (error) {
      console.error('Error saving search:', error);
    }
  };

  // Função para carregar histórico de pesquisas
  const loadSearchHistory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/search-history`, {
      method: 'GET',
      headers: API_HEADERS
    });
    
    if (response.ok) {
      const historyData = await response.json();
      setSearchHistory(historyData.data || historyData);
    }
  } catch (error) {
    console.error('Error loading search history:', error);
  }
};

  // Função para limpar histórico
  const clearHistory = async () => {
    Alert.alert(
      'Limpar Histórico',
      'Tem certeza que deseja limpar todo o histórico de pesquisa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpar', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Em produção, descomente:
              
              const response = await fetch(`${API_BASE_URL}/search-history`, {
                method: 'DELETE',
                headers: API_HEADERS
              });

              if (response.ok) {
                setSearchHistory([]);
              }
              
              
              // Simulação para demonstração
              setSearchHistory([]);
            } catch (error) {
              Alert.alert('Erro', 'Falha ao limpar histórico');
            }
          }
        }
      ]
    );
  };

  // Função de pesquisa
  const handleSearch = (query) => {
    if (query.trim()) {
      saveSearchHistory(query.trim());
      // Implementar lógica de filtro aqui se necessário
    }
  };

  // Componente para renderizar anime
  const renderAnime = ({ item }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <Text style={styles.cardEmoji}>{item.emoji}</Text>
      <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.cardSubtitle}>{item.episodes} episódios</Text>
      <Text style={styles.cardSeason}>{item.season} {item.year}</Text>
    </TouchableOpacity>
  );

  // Componente para renderizar manga
  const renderManga = ({ item }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <Text style={styles.cardEmoji}>{item.emoji}</Text>
      <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.cardSubtitle}>{item.chapters} capítulos</Text>
      <Text style={[styles.cardStatus, { 
        color: item.status === 'Ongoing' ? '#4ade80' : 
              item.status === 'Completed' ? '#60a5fa' : '#facc15' 
      }]}>
        {item.status}
      </Text>
    </TouchableOpacity>
  );

  // Componente para renderizar histórico
  const renderHistory = ({ item }) => (
    <TouchableOpacity 
      style={styles.historyItem}
      onPress={() => setSearchQuery(item.query)}
      activeOpacity={0.7}
    >
      <Text style={styles.searchIcon}>🔍</Text>
      <View style={styles.historyContent}>
        <Text style={styles.historyQuery}>{item.query}</Text>
        <Text style={styles.historyDate}>
          {new Date(item.search_date).toLocaleDateString('pt-BR')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Agrupar dados por temporada/categoria
  const groupAnimesBySeason = () => {
    const grouped = {};
    animes.forEach(anime => {
      const season = anime.season || 'Outros';
      if (!grouped[season]) grouped[season] = [];
      grouped[season].push(anime);
    });
    return grouped;
  };

  const groupMangasByCategory = () => {
    const grouped = {};
    mangas.forEach(manga => {
      const category = manga.category || 'Outros';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(manga);
    });
    return grouped;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0891b2" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AniPower</Text>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIconText}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar animes e mangás..."
            placeholderTextColor="#93c5fd"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch(searchQuery)}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'animes' && (
          <View style={styles.tabContent}>
            {Object.entries(groupAnimesBySeason()).map(([season, seasonAnimes]) => (
              <View key={season} style={styles.section}>
                <Text style={styles.sectionTitle}>📅 {season} 2024</Text>
                <FlatList
                  data={seasonAnimes}
                  renderItem={renderAnime}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={2}
                  scrollEnabled={false}
                  contentContainerStyle={styles.grid}
                  columnWrapperStyle={styles.row}
                />
              </View>
            ))}
          </View>
        )}

        {activeTab === 'mangas' && (
          <View style={styles.tabContent}>
            {Object.entries(groupMangasByCategory()).map(([category, categoryMangas]) => (
              <View key={category} style={styles.section}>
                <Text style={styles.sectionTitle}>📚 {category}</Text>
                <FlatList
                  data={categoryMangas}
                  renderItem={renderManga}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={2}
                  scrollEnabled={false}
                  contentContainerStyle={styles.grid}
                  columnWrapperStyle={styles.row}
                />
              </View>
            ))}
          </View>
        )}

        {activeTab === 'historico' && (
          <View style={styles.tabContent}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>🕒 Histórico de Pesquisa</Text>
              {searchHistory.length > 0 && (
                <TouchableOpacity onPress={clearHistory} style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>Limpar</Text>
                </TouchableOpacity>
              )}
            </View>

            {searchHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🕒</Text>
                <Text style={styles.emptyStateTitle}>Nenhuma pesquisa ainda</Text>
                <Text style={styles.emptyStateSubtitle}>Suas pesquisas aparecerão aqui</Text>
              </View>
            ) : (
              <FlatList
                data={searchHistory}
                renderItem={renderHistory}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navButton, activeTab === 'animes' && styles.navButtonActive]}
          onPress={() => setActiveTab('animes')}
          activeOpacity={0.7}
        >
          <Text style={[styles.navIcon, activeTab === 'animes' && styles.navIconActive]}>📺</Text>
          <Text style={[styles.navText, activeTab === 'animes' && styles.navTextActive]}>
            Animes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, activeTab === 'mangas' && styles.navButtonActive]}
          onPress={() => setActiveTab('mangas')}
          activeOpacity={0.7}
        >
          <Text style={[styles.navIcon, activeTab === 'mangas' && styles.navIconActive]}>📖</Text>
          <Text style={[styles.navText, activeTab === 'mangas' && styles.navTextActive]}>
            Mangás
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, activeTab === 'historico' && styles.navButtonActive]}
          onPress={() => setActiveTab('historico')}
          activeOpacity={0.7}
        >
          <Text style={[styles.navIcon, activeTab === 'historico' && styles.navIconActive]}>🕒</Text>
          <Text style={[styles.navText, activeTab === 'historico' && styles.navTextActive]}>
            Histórico
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  loadingText: {
    color: '#93c5fd',
    fontSize: 16,
    marginTop: 12,
  },
  header: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e40af',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: '#0891b2',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e40af',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  searchIconText: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    paddingVertical: 14,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#93c5fd',
    marginBottom: 16,
  },
  grid: {
    paddingHorizontal: 4,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#1e40af',
    borderRadius: 12,
    padding: 16,
    margin: 4,
    width: (width - 48) / 2,
    borderWidth: 1,
    borderColor: '#3b82f6',
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 6,
    textAlign: 'center',
    minHeight: 34,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#93c5fd',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardSeason: {
    fontSize: 12,
    color: '#60a5fa',
    textAlign: 'center',
  },
  cardStatus: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#93c5fd',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ef4444',
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e40af',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyQuery: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  historyDate: {
    fontSize: 12,
    color: '#93c5fd',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    color: '#93c5fd',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#60a5fa',
    textAlign: 'center',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#1e3a8a',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#1e40af',
    paddingBottom: 20,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  navButtonActive: {
    backgroundColor: '#0891b2',
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navIconActive: {
    fontSize: 22,
  },
  navText: {
    fontSize: 12,
    color: '#93c5fd',
    fontWeight: '500',
  },
  navTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default AnimeApp;