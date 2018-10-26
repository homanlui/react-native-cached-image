'use strict';

const _ = require('lodash');
const React = require('react');
const ReactNative = require('react-native');

const PropTypes = require('prop-types');

const ImageCacheManagerOptionsPropTypes = require('./ImageCacheManagerOptionsPropTypes');

const ImageCacheManager = require('./ImageCacheManager');

const {
          ImageBackground,
          NetInfo,
          StyleSheet,
      } = ReactNative;

const styles = StyleSheet.create({
    image: {
        backgroundColor: 'transparent'
    }
});

function getImageProps(props) {
    return _.omit(props, ['source', 'placeholderSource', 'fallbackSource', 'style', 'useQueryParamsInCacheKey', 'renderImage', 'resolveHeaders']);
}

const CACHED_IMAGE_REF = 'cachedImage';

class CachedImage extends React.Component {

    static propTypes = {
        renderImage: PropTypes.func.isRequired,

        // ImageCacheManager options
        ...ImageCacheManagerOptionsPropTypes
    };

    static defaultProps = {
<<<<<<< HEAD
        renderImage: props => (<ImageBackground imageStyle={props.style} ref={CACHED_IMAGE_REF} {...props} />),
        placeholderSource: { uri: "https://placeholder" }
=======
            renderImage: props => (<ImageBackground ref={CACHED_IMAGE_REF} {...props} />),
            activityIndicatorProps: {},
>>>>>>> f7230506156da0fcb883eaf05b45e9173ae5eaad
    };

    static contextTypes = {
        getImageCacheManager: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            isCacheable: true,
            cachedImagePath: null,
            networkAvailable: true
        };

        this.getImageCacheManagerOptions = this.getImageCacheManagerOptions.bind(this);
        this.getImageCacheManager = this.getImageCacheManager.bind(this);
        this.safeSetState = this.safeSetState.bind(this);
        this.handleConnectivityChange = this.handleConnectivityChange.bind(this);
        this.processSource = this.processSource.bind(this);
        this.renderPlaceholder = this.renderPlaceholder.bind(this);
    }

    componentWillMount() {
        this._isMounted = true;
        NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
        // initial
        NetInfo.isConnected.fetch()
            .then(isConnected => {
                this.safeSetState({
                    networkAvailable: isConnected
                });
            });

        this.processSource(this.props.source);
    }

    componentWillUnmount() {
        this._isMounted = false;
        NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(this.props.source, nextProps.source)) {
            this.processSource(nextProps.source);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if(!prevState.networkAvailable && this.state.networkAvailable)
            this.processSource(this.props.source)
    }

    setNativeProps(nativeProps) {
        try {
            this.refs[CACHED_IMAGE_REF].setNativeProps(nativeProps);
        } catch (e) {
            console.error(e);
        }
    }

    getImageCacheManagerOptions() {
        return _.pick(this.props, _.keys(ImageCacheManagerOptionsPropTypes));
    }

    getImageCacheManager() {
        // try to get ImageCacheManager from context
        if (this.context && this.context.getImageCacheManager) {
            return this.context.getImageCacheManager();
        }
        // create a new one if context is not available
        const options = this.getImageCacheManagerOptions();
        return ImageCacheManager(options);
    }

    safeSetState(newState) {
        if (!this._isMounted) {
            return;
        }
        return this.setState(newState);
    }

    handleConnectivityChange(isConnected) {
        this.safeSetState({
            networkAvailable: isConnected
        });
    }

    processSource(source) {
        const url = _.get(source, ['uri'], null);
        const options = this.getImageCacheManagerOptions();
        const imageCacheManager = this.getImageCacheManager();

        imageCacheManager.downloadAndCacheUrl(url, options)
            .then(cachedImagePath => {
                this.safeSetState({
                    cachedImagePath,
                    isCacheable: true
                });
            })
            .catch(err => {
                // console.warn(err);
                this.safeSetState({
                    cachedImagePath: null,
                    isCacheable: false
                });
            });
    }

    render() {
        if (this.state.isCacheable && !this.state.cachedImagePath) {
            return this.renderPlaceholder();
        }
        const props = getImageProps(this.props);
        const style = this.props.style || styles.image;
        const source = (this.state.isCacheable && this.state.cachedImagePath) ? {
            uri: 'file://' + this.state.cachedImagePath
        } : this.props.source;
        if (this.props.fallbackSource && !this.state.cachedImagePath) {
            return this.props.renderImage({
                ...props,
                key: `${props.key || source.uri}error`,
                style,
                source: this.props.fallbackSource
            });
        }
        return this.props.renderImage({
            ...props,
            key: props.key || source.uri,
            style,
            source
        });
    }

    renderPlaceholder() {
        const imageProps = getImageProps(this.props);
        const imageStyle = this.props.style;
        const source = this.props.placeholderSource;

        return this.props.renderImage({
            ...imageProps,
            style: imageStyle,
            key: source.uri,
            source
        });
    }

}

module.exports = CachedImage;
