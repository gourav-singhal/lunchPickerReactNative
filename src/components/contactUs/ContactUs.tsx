import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, Linking } from 'react-native';
import { RadioButton, Checkbox, Button, TextInput, Card, Snackbar } from 'react-native-paper';
import { Dropdown } from 'react-native-material-dropdown';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { SliderBox } from 'react-native-image-slider-box';
import { Table, Row, Rows } from 'react-native-table-component';
import { LiteCreditCardInput } from 'react-native-credit-card-input';
import Stripe from 'react-native-stripe-api';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import axios from 'axios';
import { getRootUrl, log, getStripeApiKey } from '../../common/Common';

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
    marginHorizontal: 30,
  },
  titleStyle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  donateCardViewContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    marginVertical: 35,
    marginHorizontal: 30,
  },
  rowContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },
  cardViewContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
    marginVertical: 15,
    marginHorizontal: 30,
  },
  restaurantDetailsTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  restaurantDetailsValueText: {
    fontSize: 16,
    fontWeight: 'normal',
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
    textDecorationLine: 'underline',
  },
  tableHead: {
    height: 40,
    backgroundColor: '#ed1f30',
  },
  tableHeadText: {
    margin: 6,
    color: 'white',
  },
  tableRowText: {
    margin: 6,
  },
  colorPrimary: {
    color: '#ed1f30',
  },
});

function RestaurantDetails(props: any) {
  const { t } = useTranslation();

  const [restaurantDetails, setRestaurantDetails] = useState({});
  const [photosList, setPhotosList] = useState([]);
  const [name, setName] = useState('');
  const [locationStr, setLocationStr] = useState('');

  useEffect(() => {
    if (!_.isEmpty(props.id)) {
      getRestaurantsDetailsById(props.id);
    }
  }, [props.id]);

  const getRestaurantsDetailsById = (id: string) => {
    axios
      .get(`${ROOT_URL}/restaurant/get-restaurant-details/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        if (!_.isEmpty(response)) {
          log('response = ', response);
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
          log('error = ', error);
        }
      });
  };

  const handleBackToHome = () => {
    props.navigation.navigate(t('home'));
  };

  const handleOpenUrl = () => {
    Linking.openURL(`${(restaurantDetails as any).url}`);
  };

  const handleLocationClick = () => {
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${locationStr}`);
  };

  const renderOpeningTimeTable = () => {
    let table = null;

    const formattedDataList: any[] = [];
    let hoursType = '';
    let isOpenNow = '';

    if (!_.isEmpty(restaurantDetails)) {
      const hours = (restaurantDetails as any).hours;
      if (!_.isEmpty(hours)) {
        hours.forEach((item: any, i: number) => {
          const open = item.open;
          if (!_.isEmpty(open)) {
            open.forEach((item: any, i: number) => {
              const data = [];

              switch (item.day) {
                case 0:
                  item.day = 'Mon';
                  break;
                case 1:
                  item.day = 'Tue';
                  break;
                case 2:
                  item.day = 'Wed';
                  break;
                case 3:
                  item.day = 'Thu';
                  break;
                case 4:
                  item.day = 'Fri';
                  break;
                case 5:
                  item.day = 'Sat';
                  break;
                case 6:
                  item.day = 'Sun';
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

    const tableHead = ['Days', 'Start', 'End', 'Is overnight'];
    const tableData = formattedDataList;
    if (!_.isEmpty(tableHead) && !_.isEmpty(tableData)) {
      table = (
        <Card style={style.cardViewContainer}>
          <Table borderStyle={{ borderWidth: 1.5, borderColor: 'black' }}>
            <Row data={tableHead} style={style.tableHead} textStyle={style.tableHeadText} />
            <Rows data={tableData} textStyle={style.tableRowText} />
          </Table>

          <Divder margin={10} />
          <Text style={style.titleStyle}>
            {t('hoursType')}{' '}
            <Text style={{ fontWeight: 'normal', color: style.colorPrimary.color }}>{hoursType.toLowerCase()}</Text>
          </Text>
          <Divder margin={8} />
          <View style={style.rowContainer}>
            <Checkbox status={isOpenNow ? 'checked' : 'unchecked'} disabled={true} />
            <Text style={{ fontSize: 16, marginTop: 8, marginLeft: 5 }}>{t('isOpenNow')}</Text>
          </View>
          <Divder margin={10} />
          <Button
            style={{ alignSelf: 'stretch' }}
            mode="outlined"
            color={style.colorPrimary.color}
            onPress={handleBackToHome}
          >
            {t('backToHome')}
          </Button>
        </Card>
      );
    }

    return table;
  };

  return (
    <View>
      <View style={{ marginTop: 100 }}>
        <SliderBox
          images={photosList}
          sliderBoxHeight={250}
          dotColor={style.colorPrimary.color}
          inactiveDotColor="lightgray"
        />
      </View>
      <Divder margin={8} />
      <Card style={style.cardViewContainer}>
        <Text style={style.titleStyle}>{t('restaurantDetails')}</Text>
        <Divder margin={10} />
        <Text style={style.restaurantDetailsTitleText}>
          {t('name')} <Text style={style.restaurantDetailsValueText}>{name}</Text>
        </Text>
        <Divder margin={10} />
        <Text style={style.restaurantDetailsTitleText}>
          {t('phone')} <Text style={style.restaurantDetailsValueText}>{(restaurantDetails as any).phone}</Text>
        </Text>
        <Divder margin={10} />
        <Text style={style.restaurantDetailsTitleText}>
          {t('url')}{' '}
          <Text style={style.restaurantDetailsUrlValueText} onPress={handleOpenUrl}>
            Open Url
          </Text>
        </Text>
        <Divder margin={10} />
        <Text style={style.restaurantDetailsTitleText}>
          {t('location')}{' '}
          <Text style={style.restaurantDetailsLocationValueText} onPress={handleLocationClick}>
            {locationStr}
          </Text>
        </Text>
      </Card>
      {renderOpeningTimeTable()}
    </View>
  );
}

function ContactUs(props: any) {
  const { t } = useTranslation();

  const [radioButtonValue, setRadioButtonValue] = useState('stripe');

  const [currencyList, setCurrencyList] = useState<any[]>([]);
  const [amount, setAmount] = useState('0');
  const [currency, setCurrency] = useState('');
  const [token, setToken] = useState('');
  const [card, setCard] = useState({});

  const [cardValid, setCardValid] = useState(false);
  const [cardInfoData, setCardInfoData] = useState(null);

  const [payNowButtonClicked, setPayNowButtonClicked] = useState(false);
  const [snackBarStatus, setSnackBarStatus] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState('');

  useEffect(() => {
    getCurrencyList();
  }, []);

  useEffect(() => {
    if (!_.isEmpty(amount) && !_.isEmpty(currency) && !_.isEmpty(token) && !_.isEmpty(card)) {
      creditCardPayment(parseFloat(amount), currency, token, card);
      setToken('');
      setCard({});
    }
  }, [amount, currency, token, card]);

  const getCurrencyList = () => {
    const currencyList = [
      { value: 'Hong Kong Dollar (HKD)' },
      { value: 'Singapore Dollar (SGD)' },
      { value: 'British Dollar Pound (GBP)' },
      { value: 'Chinese Renminbi Yuan (CNY)' },
      { value: 'US Dollar (USD)' },
    ];
    setCurrencyList(currencyList);
  };

  const handleRadioButton = (radioButtonValue: string) => {
    setRadioButtonValue(radioButtonValue);
  };

  const handleGithubClick = () => {
    Linking.openURL(`https://github.com/yeukfei02`);
  };

  const handleEmailClick = () => {
    Linking.openURL(`mailto:yeukfei02@gmail.com`);
  };

  const handleDonorboxClick = () => {
    Linking.openURL('https://donorbox.org/donate-for-lunch-picker-better-features-and-development');
  };

  const handleBuyMeACoffeeClick = () => {
    Linking.openURL('https://www.buymeacoffee.com/yeukfei02');
  };

  const handlePayNow = async () => {
    setPayNowButtonClicked(true);

    try {
      if (!_.isEmpty(amount) && !_.isEmpty(currency) && cardValid) {
        const stripeApiKey = getStripeApiKey();
        const apiKey = stripeApiKey;
        const client = new Stripe(apiKey);

        const token = await client.createToken({
          number: (cardInfoData as any).values.number,
          exp_month: (cardInfoData as any).values.expiry.substring(0, 2),
          exp_year: (cardInfoData as any).values.expiry.substring(3),
          cvc: (cardInfoData as any).values.cvc,
        });
        if (!_.isEmpty(token)) {
          setToken(token.id);
          setCard(token.card);

          setPayNowButtonClicked(false);
          setSnackBarStatus(true);
          setSnackBarMessage(`Payment success`);
        }
      } else {
        setPayNowButtonClicked(false);
        setSnackBarStatus(true);
        setSnackBarMessage(`Please check amount/currency/card input`);
      }
    } catch (e) {
      setPayNowButtonClicked(false);
      setSnackBarStatus(true);
      setSnackBarMessage(`Payment error = ${e.message}`);
    }
  };

  const renderSelectDropdown = () => {
    let selectDropdown = null;

    const data = getDropdownData();
    if (!_.isEmpty(data)) {
      selectDropdown = <Dropdown label={t('selectCurrency')} data={data} onChangeText={handleCurrencyChange} />;
    }

    return selectDropdown;
  };

  const renderResultDiv = () => {
    let resultDiv = null;

    if (_.isEqual(radioButtonValue, 'donorbox')) {
      resultDiv = (
        <Button
          style={{ alignSelf: 'stretch' }}
          mode="contained"
          color={style.colorPrimary.color}
          onPress={handleDonorboxClick}
        >
          Donorbox
        </Button>
      );
    } else if (_.isEqual(radioButtonValue, 'buyMeACoffee')) {
      resultDiv = (
        <Button
          style={{ alignSelf: 'stretch' }}
          mode="contained"
          color={style.colorPrimary.color}
          onPress={handleBuyMeACoffeeClick}
        >
          Buy Me A Coffee
        </Button>
      );
    } else if (_.isEqual(radioButtonValue, 'stripe')) {
      resultDiv = (
        <View style={{ alignSelf: 'stretch' }}>
          <TextInput
            mode="outlined"
            label={t('amount')}
            value={amount}
            placeholder={t('enterAmount')}
            onChangeText={(number) => handleAmountChange(parseFloat(number))}
          />
          <Divder margin={5} />
          {renderSelectDropdown()}
          <Divder margin={5} />
          <LiteCreditCardInput onChange={handleCreditCardInputChange} />
          <Divder margin={5} />
          {renderPaynowButton()}
        </View>
      );
    }

    return resultDiv;
  };

  const getDropdownData = () => {
    return currencyList;
  };

  const renderPaynowButton = () => {
    let paynowButton = (
      <Button style={{ alignSelf: 'stretch' }} mode="contained" color={style.colorPrimary.color} onPress={handlePayNow}>
        {t('payNow')}
      </Button>
    );

    if (payNowButtonClicked) {
      paynowButton = (
        <Button
          style={{ alignSelf: 'stretch' }}
          mode="contained"
          color={style.colorPrimary.color}
          disabled={true}
          onPress={handlePayNow}
        >
          {t('loading')}
        </Button>
      );
    }

    return paynowButton;
  };

  const handleAmountChange = (number: number) => {
    if (!isNaN(number)) setAmount(number.toString());
  };

  const handleCurrencyChange = (selectedCurrency: string) => {
    if (!_.isEmpty(selectedCurrency)) {
      switch (selectedCurrency) {
        case 'Hong Kong Dollar (HKD)':
          setAmount('3');
          setCurrency('hkd');
          break;
        case 'Singapore Dollar (SGD)':
          setAmount('1');
          setCurrency('sgd');
          break;
        case 'British Dollar Pound (GBP)':
          setAmount('1');
          setCurrency('gbp');
          break;
        case 'Chinese Renminbi Yuan (CNY)':
          setAmount('3');
          setCurrency('cny');
          break;
        case 'US Dollar (USD)':
          setAmount('1');
          setCurrency('usd');
          break;
        default:
      }
    }
  };

  const handleCreditCardInputChange = (inputData: any) => {
    if (!_.isEmpty(inputData)) {
      if (inputData.valid) {
        setCardInfoData(inputData);
        setCardValid(true);
      } else {
        setCardInfoData(null);
        setCardValid(false);
      }
    }
  };

  const creditCardPayment = (amount: number, currency: string, token: string, card: any) => {
    axios
      .post(
        `${ROOT_URL}/stripe/credit-card-payment`,
        {
          amount: Math.round(amount * 100),
          currency: currency,
          token: token,
          card: card,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
      .then((response) => {
        if (!_.isEmpty(response)) {
          log('response = ', response);
        }
      })
      .catch((error) => {
        if (!_.isEmpty(error)) {
          log('error = ', error);
        }
      });
  };

  const renderDiv = () => {
    let result = (
      <View>
        <Card style={style.container}>
          <Text style={style.titleStyle}>{t('contactTitle')}</Text>
          <Divder margin={5} />
          <View style={style.iconContainer}>
            <AntDesign style={{ marginRight: 15 }} name="github" size={40} color="black" onPress={handleGithubClick} />
            <MaterialIcons name="email" size={40} color="black" onPress={handleEmailClick} />
          </View>
        </Card>

        <Card style={style.donateCardViewContainer}>
          <Text style={style.titleStyle}>{t('donateTitle')}</Text>

          <Divder margin={5} />

          <View style={style.rowContainer}>
            <RadioButton
              color={style.colorPrimary.color}
              value="places"
              status={radioButtonValue === 'donorbox' ? 'checked' : 'unchecked'}
              onPress={() => handleRadioButton('donorbox')}
            />
            <Text style={{ marginTop: 8, marginLeft: 8 }}>Donorbox</Text>
          </View>

          <Divder margin={5} />

          <View style={style.rowContainer}>
            <RadioButton
              color={style.colorPrimary.color}
              value="places"
              status={radioButtonValue === 'buyMeACoffee' ? 'checked' : 'unchecked'}
              onPress={() => handleRadioButton('buyMeACoffee')}
            />
            <Text style={{ marginTop: 8, marginLeft: 8 }}>Buy Me A Coffee</Text>
          </View>

          <Divder margin={5} />

          <View style={style.rowContainer}>
            <RadioButton
              color={style.colorPrimary.color}
              value="places"
              status={radioButtonValue === 'stripe' ? 'checked' : 'unchecked'}
              onPress={() => handleRadioButton('stripe')}
            />
            <Text style={{ marginTop: 8, marginLeft: 8 }}>Stripe</Text>
          </View>

          <Divder margin={8} />
          {renderResultDiv()}
        </Card>
      </View>
    );

    if (!_.isEmpty(props.route) && !_.isEmpty(props.route.params) && !_.isEmpty(props.route.params.id)) {
      result = (
        <View>
          <RestaurantDetails navigation={props.navigation} id={props.route.params.id} />
        </View>
      );
    }

    return result;
  };

  const handleDismissSnackBar = () => {
    setSnackBarStatus(false);
  };

  return (
    <ScrollView style={style.scrollViewContainer}>
      {renderDiv()}
      <Snackbar
        visible={snackBarStatus}
        onDismiss={handleDismissSnackBar}
        action={{
          label: 'Close',
          onPress: () => {
            setSnackBarStatus(false);
          },
        }}
      >
        {snackBarMessage}
      </Snackbar>
    </ScrollView>
  );
}

export default ContactUs;