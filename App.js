import React, { useState, useEffect } from 'react';
import {View,Text,StyleSheet,TouchableOpacity,TextInput,FlatList,ScrollView,SafeAreaView,StatusBar,ActivityIndicator,Alert,Dimensions} from 'react-native';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'https://anilistmikilior1v1.p.rapidapi.com';
const API_HEADERS = {
  'X-RapidAPI-Key': '06cdd2fb15msh225e37488a3c5e9p1b6111jsn8fb0e3cd543c',
  'X-RapidAPI-Host': 'anilistmikilior1v1.p.rapidapi.com',
  'Content-Type': 'application/json'
};

const AnimeApp = () => {
  const [activeTab, setActiveTab] = useState('animes');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [animes, setAnimes] = useState([]);
  const [mangas, setMangas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Dados para demonstração (quando API falha)
  const mockAnimes = [
    { id: 1, title: 'Attack on Titan', episodes: 24, year: 2024, season: 'Verão', emoji: '🏛️' },
    { id: 2, title: 'Demon Slayer', episodes: 12, year: 2024, season: 'Verão', emoji: '⚔️' },
    { id: 3, title: 'My Hero Academia', episodes: 25, year: 2024, season: 'Verão', emoji: '🦸' },
    { id: 4, title: 'Jujutsu Kaisen', episodes: 24, year: 2024, season: 'Verão', emoji: '👹' },
    { id: 5, title: 'Chainsaw Man', episodes: 12, year: 2024, season: 'Outono', emoji: '🔗' },
    { id: 6, title: 'Spy x Family', episodes: 12, year: 2024, season: 'Outono', emoji: '🕵️' },
  ]

  const mockMangas = [
    { id: 1, title: 'One Piece', chapters: 1090, status: 'Ongoing', category: 'Ação', emoji: '🏴‍☠️' },
    { id: 2, title: 'Naruto', chapters: 700, status: 'Completed', category: 'Ação', emoji: '🍥' },
    { id: 3, title: 'Dragon Ball', chapters: 519, status: 'Completed', category: 'Ação', emoji: '🐉' },
    { id: 4, title: 'Bleach', chapters: 686, status: 'Completed', category: 'Ação', emoji: '⚔️' },
  ];

  useEffect(() => {
    loadData();
    loadSearchHistory();
  }, []);

  const getAnimeQuery = () => ({
    query: `
      query {
        Page(page: 1, perPage: 20) {
          media(type: ANIME, sort: POPULARITY_DESC) {
            id
            title {
              romaji
              english
            }
            episodes
            startDate {
              year
            }
            season
            coverImage {
              medium
            }
            genres
            averageScore
          }
        }
      }
    `
  });

  const getMangaQuery = () => ({
    query: `
      query {
        Page(page: 1, perPage: 20) {
          media(type: MANGA, sort: POPULARITY_DESC) {
            id
            title {
              romaji
              english
            }
            chapters
            status
            genres
            coverImage {
              medium
            }
            averageScore
          }
        }
      }
    `
  });

  const getSearchQuery = (searchTerm, type = null) => ({
    query: `
      query ($search: String, $type: MediaType) {
        Page(page: 1, perPage: 15) {
          media(search: $search, type: $type, sort: POPULARITY_DESC) {
            id
            title {
              romaji
              english
            }
            episodes
            chapters
            startDate {
              year
            }
            season
            status
            genres
            coverImage {
              medium
            }
            type
            averageScore
          }
        }
      }
    `,
    variables: {
      search: searchTerm,
      type: type
    }
  });

  const makeGraphQLRequest = async (query) => {
    try {
      console.log('Fazendo requisição GraphQL para:', API_BASE_URL);
      console.log('Query:', JSON.stringify(query, null, 2));
      
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify(query)
      });

      console.log('Status da resposta:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro da API:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Dados recebidos:', JSON.stringify(data, null, 2));
      
      if (data.errors) {
        console.error('Erros GraphQL:', data.errors);
        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Erro na requisição GraphQL:', error);
      return { success: false, error: error.message };
    }
  };

  const loadData = async () => {
    setLoading(true);
    console.log('Iniciando carregamento de dados...');
    
    try {
      console.log('Carregando animes...');
      const animeResult = await makeGraphQLRequest(getAnimeQuery());
      
      if (animeResult.success && animeResult.data?.Page?.media) {
        console.log('Animes carregados com sucesso:', animeResult.data.Page.media.length);
        setAnimes(animeResult.data.Page.media);
      } else {
        console.log('Falha ao carregar animes, usando mock data');
        setAnimes(mockAnimes);
      }

      console.log('Carregando mangás...');
      const mangaResult = await makeGraphQLRequest(getMangaQuery());
      
      if (mangaResult.success && mangaResult.data?.Page?.media) {
        console.log('Mangás carregados com sucesso:', mangaResult.data.Page.media.length);
        setMangas(mangaResult.data.Page.media);
      } else {
        console.log('Falha ao carregar mangás, usando mock data');
        setMangas(mockMangas);
      }

    } catch (error) {
      console.error('Erro geral no carregamento:', error);
      Alert.alert('Aviso', 'Usando dados offline devido a problemas de conexão.');
      setAnimes(mockAnimes);
      setMangas(mockMangas);
    } finally {
      setLoading(false);
      console.log('Carregamento de dados finalizado');
    }
  };

  const searchAPI = async (query) => {
    if (!query.trim()) return;

    setIsSearching(true);
    console.log('Iniciando pesquisa para:', query);
    
    try {
      const searchResult = await makeGraphQLRequest(getSearchQuery(query.trim()));

      if (searchResult.success && searchResult.data?.Page?.media) {
        console.log('Pesquisa realizada com sucesso:', searchResult.data.Page.media.length, 'resultados');
        setSearchResults(searchResult.data.Page.media);
        return searchResult.data.Page.media;
      } else {
        console.log('Falha na pesquisa da API, usando busca local');
        const localAnimes = mockAnimes.filter(anime => 
          anime.title.romaji.toLowerCase().includes(query.toLowerCase())
        );
        
        const localMangas = mockMangas.filter(manga => 
          manga.title.romaji.toLowerCase().includes(query.toLowerCase())
        );

        const results = [...localAnimes, ...localMangas];
        setSearchResults(results);
        return results;
      }
    } catch (error) {
      console.error('Erro na pesquisa:', error);
      Alert.alert('Erro', 'Falha na pesquisa. Tente novamente.');
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  const saveSearchHistory = async (query) => {
    try {
      const newHistoryItem = {
        id: Date.now(),
        query: query,
        search_date: new Date().toISOString()
      };
      
      setSearchHistory(prev => {
        const filtered = prev.filter(item => item.query.toLowerCase() !== query.toLowerCase());
        return [newHistoryItem, ...filtered].slice(0, 20);
      });
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  };

  const loadSearchHistory = async () => {
    console.log('Histórico carregado do armazenamento local');
  };

  const clearHistory = async () => {
    Alert.alert(
      'Limpar Histórico',
      'Tem certeza que deseja limpar todo o histórico de pesquisa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpar', 
          style: 'destructive',
          onPress: () => {
            setSearchHistory([]);
            Alert.alert('Sucesso', 'Histórico limpo com sucesso!');
          }
        }
      ]
    );
  };

  const handleSearch = async (query) => {
    if (query.trim()) {
      const cleanQuery = query.trim();
      await saveSearchHistory(cleanQuery);
      await searchAPI(cleanQuery);
    }
  };

  const getEmojiForGenre = (genres) => {
    if (!genres || genres.length === 0) return '📺';
    
    const genre = genres[0].toLowerCase();
    const emojiMap = {
      'action': '⚔️',
      'adventure': '🗺️',
      'comedy': '😄',
      'drama': '🎭',
      'fantasy': '🧙‍♂️',
      'horror': '👻',
      'romance': '💕',
      'sci-fi': '🚀',
      'slice of life': '🌸',
      'sports': '⚽',
      'supernatural': '👹',
      'thriller': '🔍'
    };
    
    return emojiMap[genre] || '📺';
  };

  const translateSeason = (season, year) => {
    const seasonMap = {
      'WINTER': 'Inverno',
      'SPRING': 'Primavera', 
      'SUMMER': 'Verão',
      'FALL': 'Outono'
    };
    return `${seasonMap[season] || season || ''} ${year || ''}`.trim();
  };

  const translateStatus = (status) => {
    const statusMap = {
      'RELEASING': 'Em Andamento',
      'FINISHED': 'Finalizado',
      'NOT_YET_RELEASED': 'Não Lançado',
      'CANCELLED': 'Cancelado',
      'HIATUS': 'Em Hiato'
    };
    return statusMap[status] || status || 'Desconhecido';
  };

  const renderAnime = ({ item }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <Text style={styles.cardEmoji}>{getEmojiForGenre(item.genres)}</Text>
      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.title?.romaji || item.title?.english || 'Título não disponível'}
      </Text>
      <Text style={styles.cardSubtitle}>
        {item.episodes || 'N/A'} episódios
      </Text>
      <Text style={styles.cardSeason}>
        {translateSeason(item.season, item.startDate?.year)}
      </Text>
      {item.averageScore && (
        <Text style={styles.cardScore}>⭐ {item.averageScore}%</Text>
      )}
    </TouchableOpacity>
  );

  const renderManga = ({ item }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <Text style={styles.cardEmoji}>{getEmojiForGenre(item.genres)}</Text>
      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.title?.romaji || item.title?.english || 'Título não disponível'}
      </Text>
      <Text style={styles.cardSubtitle}>
        {item.chapters || 'N/A'} capítulos
      </Text>
      <Text style={[styles.cardStatus, { 
        color: (item.status === 'RELEASING') ? '#4ade80' : 
              (item.status === 'FINISHED') ? '#60a5fa' : '#facc15' 
      }]}>
        {translateStatus(item.status)}
      </Text>
      {item.averageScore && (
        <Text style={styles.cardScore}>⭐ {item.averageScore}%</Text>
      )}
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <Text style={styles.cardEmoji}>
        {item.type === 'ANIME' ? '📺' : '📖'}
      </Text>
      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.title?.romaji || item.title?.english || 'Título não disponível'}
      </Text>
      <Text style={styles.cardSubtitle}>
        {item.type === 'ANIME' ? 
          `${item.episodes || 'N/A'} episódios` : 
          `${item.chapters || 'N/A'} capítulos`
        }
      </Text>
      <Text style={styles.cardCategory}>
        {item.type === 'ANIME' ? 'Anime' : 'Mangá'}
      </Text>
      {item.averageScore && (
        <Text style={styles.cardScore}>⭐ {item.averageScore}%</Text>
      )}
    </TouchableOpacity>
  );

  const renderHistory = ({ item }) => (
    <TouchableOpacity 
      style={styles.historyItem}
      onPress={() => {
        setSearchQuery(item.query);
        handleSearch(item.query);
      }}
      activeOpacity={0.7}
    >
      <Text style={styles.searchIcon}>🔍</Text>
      <View style={styles.historyContent}>
        <Text style={styles.historyQuery}>{item.query}</Text>
        <Text style={styles.historyDate}>
          {new Date(item.search_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const groupAnimesBySeason = () => {
    const dataToGroup = searchResults.length > 0 
      ? searchResults.filter(item => item.type === 'ANIME' || !item.type)
      : animes;
      
    const grouped = {};
    dataToGroup.forEach(anime => {
      const season = translateSeason(anime.season, anime.startDate?.year) || 'Outros';
      if (!grouped[season]) grouped[season] = [];
      grouped[season].push(anime);
    });
    return grouped;
  };

  const groupMangasByCategory = () => {
    const dataToGroup = searchResults.length > 0 
      ? searchResults.filter(item => item.type === 'MANGA' || (item.chapters && !item.episodes))
      : mangas;
      
    const grouped = {};
    dataToGroup.forEach(manga => {
      const category = manga.genres?.[0] || 'Outros';
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
          <Text style={styles.loadingText}>Carregando dados da API...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AniPower</Text>
        
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
          {isSearching && (
            <ActivityIndicator size="small" color="#93c5fd" style={{ marginLeft: 8 }} />
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'animes' && (
          <View style={styles.tabContent}>
            {searchResults.length > 0 && (
              <View style={styles.searchResultsHeader}>
                <Text style={styles.searchResultsTitle}>
                  🔍 Resultados: "{searchQuery}"
                </Text>
                <TouchableOpacity 
                  onPress={() => {
                    setSearchResults([]);
                    setSearchQuery('');
                  }}
                  style={styles.clearSearchButton}
                >
                  <Text style={styles.clearSearchText}>Limpar</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {Object.entries(groupAnimesBySeason()).map(([season, seasonAnimes]) => (
              <View key={season} style={styles.section}>
                <Text style={styles.sectionTitle}>📅 {season}</Text>
                <FlatList
                  data={seasonAnimes}
                  renderItem={searchResults.length > 0 ? renderSearchResult : renderAnime}
                  keyExtractor={(item) => `anime-${item.id}`}
                  numColumns={2}
                  scrollEnabled={false}
                  contentContainerStyle={styles.grid}
                  columnWrapperStyle={seasonAnimes.length > 1 ? styles.row : null}
                />
              </View>
            ))}
          </View>
        )}

        {activeTab === 'mangas' && (
          <View style={styles.tabContent}>
            {searchResults.length > 0 && (
              <View style={styles.searchResultsHeader}>
                <Text style={styles.searchResultsTitle}>
                  🔍 Resultados: "{searchQuery}"
                </Text>
                <TouchableOpacity 
                  onPress={() => {
                    setSearchResults([]);
                    setSearchQuery('');
                  }}
                  style={styles.clearSearchButton}
                >
                  <Text style={styles.clearSearchText}>Limpar</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {Object.entries(groupMangasByCategory()).map(([category, categoryMangas]) => (
              <View key={category} style={styles.section}>
                <Text style={styles.sectionTitle}>📚 {category}</Text>
                <FlatList
                  data={categoryMangas}
                  renderItem={searchResults.length > 0 ? renderSearchResult : renderManga}
                  keyExtractor={(item) => `manga-${item.id}`}
                  numColumns={2}
                  scrollEnabled={false}
                  contentContainerStyle={styles.grid}
                  columnWrapperStyle={categoryMangas.length > 1 ? styles.row : null}
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
                keyExtractor={(item) => `history-${item.id}`}
                scrollEnabled={false}
              />
            )}
          </View>
        )}
      </ScrollView>

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
  searchResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#1e40af',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  searchResultsTitle: {
    flex: 1,
    fontSize: 14,
    color: '#93c5fd',
    fontWeight: '600',
  },
  clearSearchButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#ef4444',
    borderRadius: 4,
  },
  clearSearchText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
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
  cardCategory: {
    fontSize: 12,
    color: '#facc15',
    fontWeight: '600',
    textAlign: 'center',
  },
  cardScore: {
    fontSize: 11,
    color: '#fbbf24',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
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