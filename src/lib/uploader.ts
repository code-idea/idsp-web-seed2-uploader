///<reference path="../../typings/uploader.d.ts"/>
// Created by baihuibo on 16/9/13.
import {module} from "angular";
import "webuploader/dist/webuploader.css";
import "./uploader.less";
import WebUploader = require('webuploader');
import swf = require('webuploader/dist/Uploader.swf');
import {UploaderOption} from "../../typings/uploader";

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
            uploadFinished: '&',
            error: '&'
        },
        require: '^?submitUploader',
        link (scope: any, el, attr, ctrl) {
            let option: UploaderOption = scope.option = scope.option || {};
            let files = scope.files = scope.files || [];
            let uploader = option.uploader = WebUploader.create({
                dnd: option.dnd, // dnd容器
                disableGlobalDnd: !!option.dnd,
                swf,
                auto: option.auto,
                method: option.method || 'post',
                formData: option.formData || {}, // 发送额外数据
                fileVal: option.name || 'file', // 上传域name
                server: option.server || 'fileupload.php',
                paste: !!option.dnd ? document : void 0,
                pick: {
                    id: el.get(0),
                    multiple: option.multiple
                },
                accept: option.accept,
                fileSingleSizeLimit: option.fileSingleSizeLimit
            });
            const modal = el.closest('.modal');
            if (modal.length) {
                modal.on('shown.bs.modal' , function () {
                    uploader && uploader['refresh']();
                });
            }

            uploader.on('fileQueued', function ($file) {
                if (option.multiple == false) {
                    // 如果是单选模式
                    files.forEach(({$$file}) => $$file && uploader.removeFile($$file, true));
                    files.length = 0;
                }

                scope.$applyAsync(function () {
                    let file = {
                        id: $file.id,
                        name: $file.name,
                        size: $file.size,
                        sizeUnit: WebUploader.formatSize($file.size),
                        percentage: 0,
                        response: null,
                        state: 'ready',
                        $$file: $file
                    };
                    $file._file = file;
                    files.push(file);
                    scope.fileQueued({$file});
                });
            });
            uploader.on('fileDequeued', function ($file) {
                scope.$applyAsync(function () {
                    let idx = files.indexOf($file._file);
                    idx > -1 && files.splice(idx, 1);
                    scope.fileDequeued({$file});
                });
            });
            uploader.on('uploadStart', function ($file) {
                scope.$applyAsync(function () {
                    $file._file.state = 'uploading';
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
                    $file._file.percentage = $percentage * 100;
                    scope.uploadProgress({$file, $percentage});
                });
            });
            uploader.on('uploadError', function ($file, $error) {
                scope.$applyAsync(function () {
                    scope.uploadError({$file, $error});
                });
            });
            uploader.on('uploadSuccess', function ($file, $response) {
                scope.$applyAsync(function () {
                    $file._file.response = $response;
                    $file._file.state = 'success';
                    scope.uploadSuccess({$file, $response});
                });
            });
            uploader.on('uploadFinished', function () {
                scope.$applyAsync(function () {
                    scope.uploadFinished();
                });
            });
            uploader.on('error', function ($type) {
                scope.$applyAsync(function () {
                    scope.error({$type});
                });
            });

            ctrl && ctrl.register(uploader);

            scope.$on('$destroy', function () {
                ctrl && ctrl.unRegister(uploader);
                uploader.destroy();
                uploader = null;
                files = null;
                option = null;
            });
        },
        restrict: 'E'
    };
});