// -----------------------------------------------------------------------------
// Polygon App - Tab Bar Component
// @author Philipp Legner
// -----------------------------------------------------------------------------


import React, { Component } from 'react';
import { Text, View, StyleSheet, Image, TextInput, Platform, Button } from 'react-native';
import Modal from 'react-native-modalbox';
import ImageSequence from 'react-native-image-sequence';

const POLYGON_IMAGES = require('../../images/polygons/polygons.js');
const POWERUP_IMAGES = require('../../images/powerups/powerups.js');
import BADGE_IMAGES from '../../images/badges/badges.js';
import ROTATIONS from '../../images/rotations.js';


const QUEUED_MODALS = [];
let OPEN_MODAL = null;

function onClose() {
  OPEN_MODAL = null;
  if (QUEUED_MODALS.length) {
    setTimeout(() => {
      let next = QUEUED_MODALS.shift();
      next.modal.open(next.data);
    }, 500);
  }
}

class AbstractModal extends Component {
  constructor() {
    super();
    this.state = {};
  }

  get height() { return 240; }

  open(data) {
    this.data = data;
    this.forceUpdate();
    this.refs.me.open();
    OPEN_MODAL = this;
  }

  queue(data) {
    if (OPEN_MODAL) {
      QUEUED_MODALS.push({modal: this, data: data});
    } else {
      this.open(data);
    }
  }

  render() {
    return (<Modal style={[styles.modal, {height: this.height}]} onClosed={onClose} position={'center'} ref={'me'}>
      <View style={styles.modalBody}>{this.renderBody()}</View>
    </Modal>);
  }
}


export class PolygonModal extends AbstractModal {
  renderBody() {
    if (!this.data) return null;
    return (<View style={styles.modalWrap}>
      <Image source={POLYGON_IMAGES[this.data.key]} style={{height: 80, width: 80}}/>
      <Text style={styles.modalTextLarge}>You’ve added a new {this.data.name} to your library!</Text>
    </View>);
  }
}

export class PolyhedronModal extends AbstractModal {

  get height() { return 320; }

  open(data) {
    AbstractModal.prototype.open.call(this, data);
    this.props.app.triggerConfetti();
  }

  renderBody() {
    if (!this.data) return null;
    return (<View style={styles.modalWrap}>
      <ImageSequence images={ROTATIONS[this.data.key]} style={{width: 120, height: 120, margin: 20}}/>
      <Text style={styles.modalTextLarge}>You've completed the {this.data.name}!</Text>
    </View>);
  }
}

export class PowerupModal extends AbstractModal {

  constructor() {
    super();
    this.state = {value: null, error: false};
  }

  get height() { return 370; }

  open(data) {
    AbstractModal.prototype.open.call(this, data);
    this.setState({value: null, error: false});
  }

  change(e) {
    this.setState({value: e.nativeEvent.text});
  }

  submit() {
    let isNumber = (typeof this.data.answer === 'number');
    let v = isNumber ? +this.state.value : this.state.value.toLowerCase();

    if (v === this.data.answer) {
      this.state.error = false;
      this.props.app.addPowerup(this.data);
      this.props.app.triggerConfetti();
      this.refs.me.close();
    } else {
      this.state.error = true;
    }
    this.setState(this.state)
  }

  renderBody() {
    if (!this.data) return null;
    let isNumber = (typeof this.data.answer === 'number');
    let keyboard = isNumber ? 'numeric' : 'default';

    // <Text style={styles.modalText}>{this.data.description}</Text>
    const modalStyles = (Platform.OS === 'ios') ?
      [styles.inputField, styles.inputFieldIOS] : styles.inputField;

    return (<View style={styles.modalWrap}>
      <Image source={POWERUP_IMAGES[this.data.key - 1]} style={styles.modalImage}/>
      <Text style={styles.modalTitle}>{this.data.name}</Text>
      <Text style={styles.modalText}>{this.data.question}</Text>
      <TextInput placeholder="???" returnKeyType="done" keyboardType={keyboard}
                 keyboardAppearance="dark" enablesReturnKeyAutomatically={true}
                 autoCorrect={false}
                 style={modalStyles}
                 onChange={this.change.bind(this)}/>
      <Text style={styles.modalError}>{this.state.error ? 'Try again!' : ''}</Text>
      <Button onPress={this.submit.bind(this)} title="Submit" disabled={!this.state.value} color="#007aff"/>
    </View>);
  }
}

export class BadgeModal extends AbstractModal {
  get height() { return 460; }
  renderBody() {
    if (!this.data) return null;
    return (<View style={styles.modalWrap}>
      <Image source={BADGE_IMAGES[this.data.key]} style={[styles.modalImage, {width: 60, height: 70}]}/>
      <Text style={styles.modalTitle}>{this.data.name}</Text>
      <Text style={styles.modalText}>{this.data.bio}</Text>
    </View>);
  }
}


const styles = StyleSheet.create({
  modal: {
    height: 240,
    backgroundColor: 'transparent'
  },
  modalBody: {
    backgroundColor: "#eee",
    padding: 20,
    paddingBottom: 0,
    flex: 1,
    margin: 20,
    borderRadius: 10
  },

  modalWrap: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  modalImage: {
    height: 80,
    width: 80,
    flexGrow: 0,
    marginBottom: 10
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Avenir-Book',
    fontWeight: 'bold'
  },
  modalTextLarge: {
    fontSize: 20,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Avenir-Book'
  },
  modalText: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Avenir-Book'
  },
  modalError: {
    fontSize: 14,
    color: '#c00',
    textAlign: 'center',
    fontFamily: 'Avenir-Book',
    marginTop: 5,
    marginBottom: 10
  },

  inputField: {
    height: 40,
    width: 200,
    textAlign: 'center',
  },
  inputFieldIOS: {
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 3
  }
});
