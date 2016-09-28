// Created by baihuibo on 16/9/13.
import {module} from "angular";
import "webuploader/dist/webuploader.css";
import "./uploader.less";
import WebUploader = require('webuploader');
import swf = require('webuploader/dist/Uploader.swf');

const modName = 'idsp-web-seed2-uploader';
export const mod = module(modName, []);
export default modName;

mod.directive("uploader", function () {
    return {
        scope: {
            option: '=?',
            files: '=?',

            fileQueued: '&',
            fileDequeued: '&',
            uploadStart: '&',
            uploadBeforeSend: '&',
            uploadProgress: '&',
            uploadError: '&',
            uploadSuccess: '&',
            error: '&'
        },
        link (scope: any, el, attr) {
            let option: UploaderOption = scope.option = scope.option || {};
            let files = scope.files = scope.files || [];

            let uploader = option.uploader = WebUploader.create({
                dnd: option.dnd, // dnd容器
                disableGlobalDnd: !!option.dnd,
                swf,
                duplicate: true, // 文件去重
                auto: option.auto,
                method: option.method || 'post',
                formData: option.formData || {}, // 发送额外数据
                fileVal: option.name || 'file', // 上传域name
                server: option.server || 'fileupload.php',
                paste: option.dnd ? document.body : void 0,
                pick: {
                    id: el.get(0),
                    multiple: option.multiple
                },
                accept: option.accept,
                fileSingleSizeLimit: option.fileSingleSizeLimit
            });

            uploader.on('fileQueued', function ($file) {
                scope.$applyAsync(function () {
                    scope.fileQueued({$file});
                    let file = {
                        name: $file.name,
                        size: $file.size,
                        sizeUnit: WebUploader.formatSize($file.size),
                        percentage: 0,
                        $$file: $file
                    };
                    $file._file = $file;
                    files.push(file);
                });
            });
            uploader.on('fileDequeued', function ($file) {
                scope.$applyAsync(function () {
                    scope.fileDequeued({$file});
                    let idx = files.indexOf($file._file);
                    idx > -1 && files.splice(idx, 1);
                });
            });
            uploader.on('uploadStart', function ($file) {
                scope.$applyAsync(function () {
                    scope.uploadStart({$file});
                });
            });
            uploader.on('uploadBeforeSend', function ($chuck, $data, $headers) {
                scope.$applyAsync(function () {
                    scope.uploadBeforeSend({$chuck, $data, $headers});
                });
            });
            uploader.on('uploadProgress', function ($file, $percentage) {
                scope.$applyAsync(function () {
                    scope.uploadProgress({$file, $percentage});
                    $file._file.percentage = $percentage * 100;
                });
            });
            uploader.on('uploadError', function ($file, $error) {
                scope.$applyAsync(function () {
                    scope.uploadError({$file, $error});
                });
            });
            uploader.on('uploadSuccess', function ($file, $response) {
                scope.$applyAsync(function () {
                    scope.uploadSuccess({$file, $response});
                    $file._file.response = $response;
                });
            });
            uploader.on('error', function ($type) {
                scope.$applyAsync(function () {
                    scope.error({$type});
                });
            });

            scope.$on('$destroy', function () {
                uploader.destroy();
                uploader = null;
                files = null;
                option = null;
            });
        },
        restrict: 'E'
    };
});