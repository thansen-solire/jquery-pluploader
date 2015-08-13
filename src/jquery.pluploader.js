/*!
 * @author Thomas <thansen@solire.fr>
 * @licence CC BY-NC 4.0 http://creativecommons.org/licenses/by-nc/4.0/
 */
(function ($) {
  var Pluploader = function (givenParams) {
    var
      defaults = {
        baseHref: '/',
        /**
         * Fires when just before a file is uploaded.
         *
         * @param {jQuery}   base
         * @param {Uploader} up
         * @param {File}     file
         *
         * @return {void}
         */
        BeforeUpload: function (base, up, file) {},
        /**
         * Fires when file chunk is uploaded.
         *
         * @param {jQuery}   base
         * @param {Uploader} up
         * @param {File}     file
         * @param {Object}   response
         *
         * @return {void}
         */
        ChunkUploaded: function (base, up, file, response) {},
        /**
         * Fires when file chunk is uploaded.
         *
         * @param {jQuery}   base
         * @param {Uploader} up
         *
         * @return {void}
         */
        Destroy: function (base, up) {},
        /**
         * Fires when a error occurs.
         *
         * @param {jQuery}   base
         * @param {Uploader} up
         * @param {Object}   err
         *
         * @return {void}
         *
         * @example
         * var file = err.file;
         * console.log(file.name + ' ERROR, ' + err.message + ', ' + plupload.formatSize(file.size) + ')');
         * up.refresh();
         */
        Error: function (base, up, err) {},
        /**
         * Fires while when the user selects files to upload.
         *
         * @param {jQuery}   base
         * @param {Uploader} up
         * @param {Array}    files
         *
         * @return {void}
         *
         * @example
         * $.each(files, function(i, file){
         *     console.log(file.name + ' (0%, ' + plupload.formatSize(file.size) + ')');
         * });
         * up.start();
         */
        FilesAdded: function (base, up, files) {
          up.start();
        },
        /**
         * Fires while a file was removed from queue.
         *
         * @param {jQuery}   base
         * @param {Uploader} up
         * @param {Array}    files
         *
         * @return {void}
         */
        FilesRemoved: function (base, up, files) {},
        /**
         * Fires when a file is successfully uploaded.
         *
         * @param {jQuery}   base
         * @param {Uploader} up
         * @param {File}     file
         * @param {Object}   response
         *
         * @return {void}
         *
         * @example
         * console.log(file.name + ' (100%, ' + plupload.formatSize(file.size) + ')');
         */
        FileUploaded: function (base, up, file, response) {},
        /**
         * Fires when a file is successfully uploaded.
         *
         * @param {jQuery}   base
         * @param {Uploader} up
         *
         * @return {void}
         *
         * @example
         * console.log('current runtime:' + params.runtime);
         */
        Init: function (base, up, params) {},
        /**
         * Fires after the init event incase you need to perform actions there.
         *
         * @param {jQuery}   base
         * @param {Uploader} up
         *
         * @return {void}
         */
        PostInit: function (base, up) {},
        /**
         * Fires when the file queue is changed.
         *
         * @param {jQuery}   base
         * @param {Uploader} up
         *
         * @return {void}
         */
        QueueChanged: function (base, up) {},
        /**
         * Fires when the silverlight/flash or other shim needs to move.
         *
         * @param {jQuery}   base
         * @param {Uploader} up
         *
         * @return {void}
         */
        Refresh: function (base, up) {},
        /**
         *
         * @param {jQuery}   base
         * @param {Uploader} up
         *
         * @return {void}
         */
        StateChanged: function (base, up) {},
        /**
         * Fires when all files in a queue are uploaded.
         *
         * @param {jQuery}   base
         * @param {Uploader} up
         * @param {Array}    files
         *
         * @return {void}
         */
        UploadComplete: function (base, up, files) {},
        /**
         * Fires when a file is to be uploaded by the runtime.
         *
         * @param {jQuery}   base
         * @param {Uploader} up
         * @param {File}     file
         *
         * @return {void}
         */
        UploadFile: function (base, up, file) {},
        /**
         * Fires while a file is being uploaded.
         *
         * @param {jQuery}   base
         * @param {Uploader} up
         * @param {File}     file
         *
         * @return {void}
         *
         * @example
         * console.log(file.name + ' (' + file.percent + '%, ' + plupload.formatSize(file.size) + ')');
         */
        UploadProgress: function (base, up, file) {}
      },
      defaultsPlupload = {
        url: 'upload.php',
        runtimes: 'html5,gears,flash,silverlight,browserplus',
        max_file_size: '50mb',
        filters: [
          {title: "Image files", extensions: "jpg,gif,png"},
          {title: "Zip files", extensions: "zip"},
          {title: "Adobe", extensions: "pdf,ai,psd,indd"}
        ],
        flash_swf_url: 'plupload.flash.swf',
        silverlight_xap_url: 'plupload.silverlight.xap',
        multi_selection: false,
        unique_names: false,
        chunk_size: '1mb',
        multipart_params: {}
      },
      params = $.extend({}, defaults, givenParams),
      paramsPlupload = $.extend({}, defaultsPlupload),
      initUploader = function () {
        var
          domId,
          parentDom = null,
          parentDomId = null
        ;

        $(this).unbind('click').click(function (evnt) {
          evnt.preventDefault();
        });

        domId = $(this).attr('id');
        if (domId == null || domId == ''
            || $('[id=' + domId + ']').length > 1
        ) {
          domId = randomId('pluploader-');
          $(this).attr('id', domId);
        }
        paramsPlupload.browse_button = domId;

        if ('drop_element' in params
            && params.drop_element != null
        ) {
          switch (typeof params.drop_element) {
            case 'string' :
              if ($(params.drop_element).length > 0) {
                parentDom = $(params.drop_element);
              } else {
                if ($('#' + params.drop_element).length > 0) {
                  parentDom = $(params.drop_element);
                }
              }
              break;

            case 'function' :
              parentDom = params.drop_element.call(this);
              if (!parentDom instanceof jQuery) {
                parentDom = null;
              }
              break;

            default :
              if (params.drop_element instanceof jQuery) {
                parentDom = params.drop_element;
              }
              break;
          }
        }

        if (parentDom != null) {
          parentDomId = parentDom.attr('id');
          if (parentDomId == null
              || parentDomId == ''
              || $('[id=' + parentDomId + ']').length > 1
          ) {
            parentDomId = randomId('pluploader-container-');
            parentDom.attr('id', parentDomId);
          }
          paramsPlupload.drop_element = parentDomId;
        }

        this.uploader = _createUploader(this, paramsPlupload, params);
      },
      key
    ;

    paramsPlupload.flash_swf_url = params.baseHref + paramsPlupload.flash_swf_url;
    paramsPlupload.silverlight_xap_url = params.baseHref + paramsPlupload.silverlight_xap_url;

    for (key in defaultsPlupload) {
      if (key in params) {
        paramsPlupload[key] = params[key];
      }
    }

    return this.each(initUploader);

    /**
     * Génère une chaine alphanumérique aléatoire
     *
     * @param {int} length
     *
     * @returns {String}
     */
    function randomString(length)
    {
      var text = '', i = 0,
              possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
              + 'abcdefghijklmnopqrstuvwxyz'
              + '0123456789';

      for (i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }

      return text;
    }

    /**
     * Génére un attribut id unique (pour element HTML)
     *
     * @param {String} prefixe
     *
     * @return {String}
     */
    function randomId(prefixe)
    {
      do {
        tmpId = randomString(10);
      } while ($('#' + prefixe + tmpId).length > 0)

      return prefixe + tmpId;
    }

    /**
     * Génére un uploader (plupload)
     *
     * @param {jQuery} base
     * @param {Object} paramsPlupload
     * @param {Object} params
     *
     * @return {Uploader}
     */
    function _createUploader(base, paramsPlupload, params)
    {
      var uploader = new plupload.Uploader(paramsPlupload);

      uploader.bind('Init', function (up, params2) {
        params.Init.call(this, base, up, params2);
      });

      uploader.bind('PostInit', function (up) {
        params.Init.call(this, base, up);
      });

      uploader.init();

      uploader.bind('BeforeUpload', function (up, file) {
        params.BeforeUpload.call(this, base, up, file);
      });

      uploader.bind('ChunkUploaded', function (up, file, response) {
        params.ChunkUploaded.call(this, base, up, file, response);
      });

      uploader.bind('Destroy', function (up) {
        params.Destroy.call(this, base, up);
      });

      uploader.bind('Error', function (up, err) {
        params.Error.call(this, base, up, err);
      });

      uploader.bind('FilesAdded', function (up, files) {
        params.FilesAdded.call(this, base, up, files);
      });

      uploader.bind('FilesRemoved', function (up, files) {
        params.FilesRemoved.call(this, base, up, files);
      });

      uploader.bind('FileUploaded', function (up, file, response) {
        params.FileUploaded.call(this, base, up, file, response);
      });

      uploader.bind('QueueChanged', function (up) {
        params.QueueChanged.call(this, base, up);
      });

      uploader.bind('Refresh', function (up) {
        params.Refresh.call(this, base, up);
      });

      uploader.bind('StateChanged', function (up) {
        params.StateChanged.call(this, base, up);
      });

      uploader.bind('UploadComplete', function (up, files) {
        params.UploadComplete.call(this, base, up, files);
      });

      uploader.bind('UploadFile', function (up, file) {
        params.UploadFile.call(this, base, up, file);
      });

      uploader.bind('UploadProgress', function (up, file) {
        params.UploadProgress.call(this, base, up, file);
      });

      return uploader;
    }
  };

  $.fn.pluploader = Pluploader;
})(jQuery);
