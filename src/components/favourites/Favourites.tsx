import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, RefreshControl } from 'react-native';
import { Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import axios from 'axios';
import { getRootUrl, log } from '../../common/Common';

const ROOT_URL = getRootUrl();

import Divder from '../divider/Divider';
import DisplayResult from '../displayResult/DisplayResult';

const style = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
    backgroundColor: '#FAFAD2',
  },
  container: {
    flex: 1,
    marginTop: 50,
    padding: 20,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  yourTotalFavouritesText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  favouritesLengthText: {
    fontWeight: 'normal',
  },
  colorPrimary: {
    color: '#ed1f30',
  },
});

function Favourites(props: any): JSX.Element {
  const { t } = useTranslation();

  const [favourites, setFavourites] = useState([]);

  const [deleteAllFavouritesButtonClicked, setDeleteAllFavouritesButtonClicked] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getFavourites();
  }, []);

  useEffect(() => {
    detectChangeTab(props.navigation);
  }, [props.navigation]);

  const detectChangeTab = (navigation: any) => {
    navigation.addListener('focus', () => {
      getFavourites();
    });
  };

  const getFavourites = async () => {
    const response = await axios.get(`${ROOT_URL}/favourites/get-favourites`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!_.isEmpty(response)) {
      log('response = ', response);
      const favourites = response.data.favourites;
      setFavourites(favourites);
    }
  };

  const handleDeleteAllFavourites = async () => {
    setDeleteAllFavouritesButtonClicked(true);

    const response = await axios.delete(`${ROOT_URL}/favourites/delete-all-favourites`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!_.isEmpty(response)) {
      log('response = ', response);
      setDeleteAllFavouritesButtonClicked(false);
      getFavourites();
    }
  };

  const renderDeleteAllFavouritesButton = () => {
    let deleteAllFavouritesButton = (
      <Button mode="contained" color={style.colorPrimary.color} onPress={handleDeleteAllFavourites}>
        {t('deleteAllFavourites')}
      </Button>
    );

    if (deleteAllFavouritesButtonClicked === true) {
      deleteAllFavouritesButton = (
        <Button mode="contained" color={style.colorPrimary.color} disabled={true} onPress={handleDeleteAllFavourites}>
          {t('loading')}
        </Button>
      );
    }

    return deleteAllFavouritesButton;
  };

  const renderDisplayResult = () => {
    let displayResult = null;

    if (!_.isEmpty(favourites)) {
      displayResult = (
        <View>
          <DisplayResult
            navigation={props.navigation}
            resultList={favourites}
            isFavourites={true}
            getFavourites={() => getFavourites()}
          />
        </View>
      );
    }

    return displayResult;
  };

  const onRefresh = () => {
    setRefreshing(true);
    getFavourites();

    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <ScrollView
      style={style.scrollViewContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ed1f30', '#ed1f30', '#2b76f0']} />
      }
    >
      <View style={style.container}>
        <Text style={style.yourTotalFavouritesText}>
          {t('yourTotalFavourites')}{' '}
          <Text style={style.favouritesLengthText}>{favourites ? favourites.length : 0}</Text>
        </Text>

        <Divder margin={5} />

        {renderDeleteAllFavouritesButton()}
      </View>

      {renderDisplayResult()}
    </ScrollView>
  );
}

export default Favourites;
