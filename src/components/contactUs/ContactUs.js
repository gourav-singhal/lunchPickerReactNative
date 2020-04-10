import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, Button, Linking } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { SliderBox } from "react-native-image-slider-box";
import { Table, Row, Rows } from 'react-native-table-component';
import _ from 'lodash';
import axios from 'axios';
import { getRootUrl, log } from '../../common/Common';

import Divder from '../divider/Divider';

const ROOT_URL = getRootUrl();

const style = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
    backgroundColor: '#FAFAD2',
  },
  container: {
    flex: 1,
    marginTop: 100,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 30
  },
  titleStyle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  iconContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  radioButtonContainer: {
    flex: 1,
    marginTop: 50,
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    marginHorizontal: 30
  },
  rowContainer: {
    flexDirection: 'row'
  },
  cardViewContainer: {
    flex: 1,
    marginTop: 10,
    marginBottom: 20,
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    marginHorizontal: 30
  },
  restaurantDetailsTitleText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  restaurantDetailsValueText: {
    fontSize: 16,
    fontWeight: 'normal'
  },
  restaurantDetailsUrlValueText: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#ed1f30',
  },
  restaurantDetailsLocationValueText: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#ed1f30',
    textDecorationLine: 'underline'
  },
  tableHead: {
    height: 40,
    backgroundColor: '#ed1f30',
  },
  tableHeadText: {
    margin: 6,
    color: 'white'
  },
  tableRowText: {
    margin: 6,
  },
  colorPrimary: {
    color: '#ed1f30'
  }
});

function RestaurantDetails({ navigation, id }) {
  const [restaurantDetails, setRestaurantDetails] = useState({});
  const [photosList, setPhotosList] = useState([]);
  const [name, setName] = useState('');
  const [locationStr, setLocationStr] = useState('');

  useEffect(() => {
    if (!_.isEmpty(id)) {
      getRestaurantsDetailsById(id);
    }
  }, [id]);

  const getRestaurantsDetailsById = (id) => {
    axios.get(
      `${ROOT_URL}/restaurant/get-restaurant-details/${id}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
      .then((response) => {
        if (!_.isEmpty(response)) {
          log("response = ", response);
          setRestaurantDetails(response.data.restaurantDetails);

          const name = response.data.restaurantDetails.name;
          setName(name);

          const photos = response.data.restaurantDetails.photos;
          setPhotosList(photos);

          const location = response.data.restaurantDetails.location;
          let locationStr = '';
          if (!_.isEmpty(location)) {
            if (!_.isEmpty(location.display_address)) {
              locationStr = location.display_address.join(', ');
            }
          }
          setLocationStr(locationStr);
        }
      })
      .catch((error) => {
        if (!_.isEmpty(error)) {
          log("error = ", error);
        }
      });
  }

  const handleBackToHome = () => {
    navigation.navigate('Home');
  }

  const handleOpenUrl = () => {
    Linking.openURL(`${restaurantDetails.url}`);
  }

  const handleLocationClick = () => {
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${locationStr}`);
  }

  const renderOpeningTimeTable = () => {
    let table = null;

    let formattedDataList = [];
    let hoursType = '';
    let isOpenNow = '';

    if (!_.isEmpty(restaurantDetails)) {
      const hours = restaurantDetails.hours;
      if (!_.isEmpty(hours)) {
        hours.forEach((item, i) => {
          const open = item.open;
          if (!_.isEmpty(open)) {
            open.forEach((item, i) => {
              let data = [];

              switch (item.day) {
                case 0:
                  item.day = "Mon";
                  break;
                case 1:
                  item.day = "Tue";
                  break;
                case 2:
                  item.day = "Wed";
                  break;
                case 3:
                  item.day = "Thu";
                  break;
                case 4:
                  item.day = "Fri";
                  break;
                case 5:
                  item.day = "Sat";
                  break;
                case 6:
                  item.day = "Sun";
                  break;
                default:

              }
              if (!item.start.includes(':')) {
                item.start = `${item.start.substring(0, 2)}:${item.start.substring(2)}`;
              }
              if (!item.end.includes(':')) {
                item.end = `${item.end.substring(0, 2)}:${item.end.substring(2)}`;
              }
              item.is_overnight = item.is_overnight ? 'yes' : 'no';

              data.push(item.day);
              data.push(item.start);
              data.push(item.end);
              data.push(item.is_overnight);
              formattedDataList.push(data);
            });
          }

          hoursType = item.hours_type;
          isOpenNow = item.is_open_now;
        });
      }
    }

    const tableHead = [
      'Days',
      'Start',
      'End',
      'Is overnight'
    ];
    const tableData = formattedDataList;
    if (!_.isEmpty(tableHead) && !_.isEmpty(tableData)) {
      table = (
        <View>
          <Table borderStyle={{ borderWidth: 1.5, borderColor: 'black' }}>
            <Row data={tableHead} style={style.tableHead} textStyle={style.tableHeadText} />
            <Rows data={tableData} textStyle={style.tableRowText} />
          </Table>
          <Divder margin={5} />
          <View style={style.cardViewContainer}>
            <Text style={style.titleStyle}>Hours type: <Text style={{ fontWeight: 'normal', color: style.colorPrimary.color }}>{hoursType.toLowerCase()}</Text></Text>
            <Divder margin={10} />

            <Divder margin={10} />
            <Button
              onPress={handleBackToHome}
              title="Back to Home"
              color={style.colorPrimary.color}
            >
              Back to Home
            </Button>
          </View>
        </View>
      );
    }

    return table;
  }

  return (
    <View>
      <View style={{ marginTop: 100 }}>
        <SliderBox
          images={photosList}
          sliderBoxHeight={250}
          dotColor={style.colorPrimary.color}
          inactiveDotColor="lightgray" />
      </View>
      <Divder margin={8} />
      <View style={style.cardViewContainer}>
        <Text style={style.titleStyle}>Restaurant details</Text>
        <Divder margin={10} />
        <Text style={style.restaurantDetailsTitleText}>Name: <Text style={style.restaurantDetailsValueText}>{name}</Text></Text>
        <Divder margin={10} />
        <Text style={style.restaurantDetailsTitleText}>Phone: <Text style={style.restaurantDetailsValueText}>{restaurantDetails.phone}</Text></Text>
        <Divder margin={10} />
        <Text style={style.restaurantDetailsTitleText}>Url: <Text style={style.restaurantDetailsUrlValueText} onPress={handleOpenUrl}>Open Url</Text></Text>
        <Divder margin={10} />
        <Text style={style.restaurantDetailsTitleText}>Location: <Text style={style.restaurantDetailsLocationValueText} onPress={handleLocationClick}>{locationStr}</Text></Text>
      </View>
      {renderOpeningTimeTable()}
    </View >
  );
}

function ContactUs({ navigation, route }) {
  const [radioButtonValue, setRadioButtonValue] = useState('');

  const handleRadioButton = (radioButtonValue) => {
    setRadioButtonValue(radioButtonValue);
  }

  const handleDonorboxClick = () => {
    Linking.openURL('https://donorbox.org/donate-for-lunch-picker-better-features-and-development');
  }

  const handleBuyMeACoffeeClick = () => {
    Linking.openURL('https://www.buymeacoffee.com/yeukfei02');
  }

  const handleStripeClick = () => {

  }

  const renderButton = () => {
    let result = null;

    if (_.isEqual(radioButtonValue, 'donorbox')) {
      result = (
        <Button
          onPress={handleDonorboxClick}
          title="Donorbox"
          color={style.colorPrimary.color}
        >
          Donorbox
        </Button>
      );
    } else if (_.isEqual(radioButtonValue, 'buyMeACoffee')) {
      result = (
        <Button
          onPress={handleBuyMeACoffeeClick}
          title="Buy Me A Coffee"
          color={style.colorPrimary.color}
        >
          Buy Me A Coffee
        </Button>
      );
    } else if (_.isEqual(radioButtonValue, 'stripe')) {

    }

    return result;
  }

  const handleGithubClick = () => {
    Linking.openURL(`https://github.com/yeukfei02`);
  }

  const handleEmailClick = () => {
    Linking.openURL(`mailto:yeukfei02@gmail.com`);
  }

  const renderDiv = () => {
    let result = (
      <View>
        <View style={style.container}>
          <Text style={style.titleStyle}>Contact us via email or visit our github repo</Text>
          <Divder margin={5} />
          <View style={style.iconContainer}>
            <AntDesign style={{ marginRight: 15 }} name="github" size={40} color="black" onPress={handleGithubClick} />
            <MaterialIcons name="email" size={40} color="black" onPress={handleEmailClick} />
          </View>
        </View>

        <View style={style.radioButtonContainer}>
          <Text style={style.titleStyle}>Donate for lunch picker better features and development</Text>

          <Divder margin={5} />

          <View style={style.rowContainer}>
            <RadioButton
              value="places"
              status={radioButtonValue === 'donorbox' ? 'checked' : 'unchecked'}
              onPress={() => handleRadioButton('donorbox')}
            />
            <Text style={{ marginTop: 8, marginLeft: 8 }}>Donorbox</Text>
          </View>

          <Divder margin={5} />

          <View style={style.rowContainer}>
            <RadioButton
              value="places"
              status={radioButtonValue === 'buyMeACoffee' ? 'checked' : 'unchecked'}
              onPress={() => handleRadioButton('buyMeACoffee')}
            />
            <Text style={{ marginTop: 8, marginLeft: 8 }}>Buy Me A Coffee</Text>
          </View>

          <Divder margin={5} />

          <View style={style.rowContainer}>
            <RadioButton
              value="places"
              status={radioButtonValue === 'stripe' ? 'checked' : 'unchecked'}
              onPress={() => handleRadioButton('stripe')}
            />
            <Text style={{ marginTop: 8, marginLeft: 8 }}>Stripe</Text>
          </View>

          <Divder margin={8} />
          {renderButton()}
        </View>
      </View>
    );

    if (!_.isEmpty(route) && !_.isEmpty(route.params) && !_.isEmpty(route.params.id)) {
      result = (
        <View>
          <RestaurantDetails navigation={navigation} id={route.params.id} />
        </View>
      );
    }

    return result;
  }

  return (
    <ScrollView style={style.scrollViewContainer}>
      {renderDiv()}
    </ScrollView>
  );
}

export default ContactUs;
