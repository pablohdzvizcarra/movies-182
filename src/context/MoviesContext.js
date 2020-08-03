import React, { createContext, useReducer, useCallback } from 'react';
import { moviesReducer } from '../reducers/moviesReducer';
import { types } from '../types/types';
import { db, firebase } from '../libs/firebase';

export const MoviesContext = createContext();



export const MoviesProvider = ({ children }) => {


  const [state, dispatch] = useReducer(moviesReducer, {
    movies: [],
    favoriteMovies: [],
    searchMovie: [],
    movie: {}
  });
  
  const { movies, favoriteMovies, searchMovie, movie } = state;
  

  const getTopRatedMovies = useCallback(async () => {
    try {
      const apiKey = process.env.REACT_APP_APIKEY;
      
      console.log('OBTENIENDO PELICULAS');
      const data = await fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=es-MX&page=1`);
      const { results } = await data.json();
      
      dispatch({
        type: types.loadingTopRatedMovies,
        payload: results
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getPopularMovies = useCallback(async () => {
    try {
      const apiKey = process.env.REACT_APP_APIKEY;
      
      console.log('OBTENIENDO PELICULAS');
      const data = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=es-MX&page=1`);
      const { results } = await data.json();
      
      dispatch({
        type: types.loadingPopularMovies,
        payload: results
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getUpcomingMovies = useCallback(async () => {

    try {
      const apiKey = process.env.REACT_APP_APIKEY;
      
      console.log('OBTENIENDO PELICULAS');
      const data = await fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}&language=es-MX&page=1`);
      const { results } = await data.json();
      
      dispatch({
        type: types.loadingUpcomingMovies,
        payload: results
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getMovieSearch = async (key) => {

    try {
      const apiKey = process.env.REACT_APP_APIKEY;
      const data = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${key}`);
      
      const { results } = await data.json();

      dispatch({
        type: types.searchMovies,
        payload: results
      });

    } catch (error) {
      console.log(error);
    }
  }

  const getMovieID = async (movieID) => {

    try {

      const apiKey = process.env.REACT_APP_APIKEY;
      const data = await fetch(`https://api.themoviedb.org/3/movie/${movieID}?api_key=${apiKey}&language=es-ES`);

      const resp = await data.json();
      
      dispatch({
        type: types.selectedMovie,
        payload: resp
      })
      
    } catch (error) {
      console.log(error);
    }
  }

  const addFavoriteMovie = async (movie) => {

    const {
      poster_path,
      id,
      genres,
      original_title,
      original_language,
      overview,
      popularity,
      production_countries,
      release_date,
      tagline,
      title,
      vote_average,
      vote_count
    } = movie;

    const imgMovie = `https://image.tmdb.org/t/p/w500/${poster_path}`;

    const favoriteMovie = {
      imgMovie,
      id,
      genres,
      original_title,
      original_language,
      overview,
      popularity,
      production_countries,
      release_date,
      tagline,
      title,
      vote_average,
      vote_count
    }

    const { uid } = firebase.auth().currentUser;

    if (uid) {

      const { id } = await db.collection(uid).doc('movies').collection('favorites').add(favoriteMovie);

      favoriteMovie.firebaseID = id;

      dispatch({
        type: types.addFavoriteMovie,
        payload: favoriteMovie
      })
      
      console.log('PELICULA AGREGADA A FAVORITOS');

    } else {
      throw new Error('No hay usuario autenticado')
    }


  }
  
  return (
    <MoviesContext.Provider value={{
      movie,
      movies,
      favoriteMovies,
      searchMovie,
      getMovieID,
      getPopularMovies,
      getTopRatedMovies,
      getUpcomingMovies,
      getMovieSearch,
      addFavoriteMovie,
      dispatch
    }}>
      {children}
    </MoviesContext.Provider>
  )
}