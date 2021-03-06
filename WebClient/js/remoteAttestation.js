// utilitis functions for web sgx remote attestation
function hexToBase64(hexstring) {
    return btoa(hexstring.match(/\w{2}/g).map(function(a) {
        return String.fromCharCode(parseInt(a, 16));
    }).join(""));
}

function HEX2Base64URL(str) {
    var hexArray = str.replace(/\r|\n/g, "")
        .replace(/([\da-fA-F]{2}) ?/g, "0x$1 ")
        .replace(/ +$/, "")
        .split(" ");
    var byteString = String.fromCharCode.apply(null, hexArray);
    var base64string = window.btoa(byteString);
    var base64stringURL = base64string.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
    return base64stringURL;
}

function Base64URL2HEX(str) {
    str = (str + '=').slice(0, str.length + (str.length % 4));
    var base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    var raw = atob(base64);

    var HEX = '';

    for (i = 0; i < raw.length; i++) {

        var _hex = raw.charCodeAt(i).toString(16)

        HEX += (_hex.length == 2 ? _hex : '0' + _hex);
    }
    return HEX.toUpperCase();
}


function convertStringToArrayBufferView(str) {
    var bytes = new Uint8Array(str.length);
    for (var iii = 0; iii < str.length; iii++) {
        bytes[iii] = str.charCodeAt(iii);
    }

    return bytes;
}

function convertArrayBufferToHexaDecimal(buffer) {
    var data_view = new DataView(buffer)
    var iii, len, hex = '',
        c;

    for (iii = 0, len = data_view.byteLength; iii < len; iii += 1) {
        c = data_view.getUint8(iii).toString(16);
        if (c.length < 2) {
            c = '0' + c;
        }

        hex += c;
    }

    return hex;
}

function byteToHexString(uint8arr) {
    if (!uint8arr) {
        return '';
    }

    var hexStr = '';
    for (var i = 0; i < uint8arr.length; i++) {
        var hex = (uint8arr[i] & 0xff).toString(16);
        hex = (hex.length === 1) ? '0' + hex : hex;
        hexStr += hex;
    }

    return hexStr.toUpperCase();
}

function hexStringToByte(str) {
    if (!str) {
        return new Uint8Array();
    }

    var a = [];
    for (var i = 0, len = str.length; i < len; i += 2) {
        a.push(parseInt(str.substr(i, 2), 16));
    }

    return new Uint8Array(a);
}

function unitArrayChangeEndian(uint8arr) {
    var tmpHex = byteToHexString(uint8arr);
    var changedStr = changeEndian(tmpHex);
    return hexStringToByte(changedStr);
}

function changeEndian(str) {
    var arr = str.match(/.{1,2}/g);
    return arr.reverse().join("").toString();
}

function flippedString(str) {
    var str = "018c03d1533457adeaaeb6653b6a861fec879c4311de663bcea1522dbb6ce790";
    var arr = str.match(/.{1,2}/g);
    var flipped_arr = [];
    for (var i = 0; i < arr.length; i++) {
        var tmp = arr[i].split("").reverse().join("");
        flipped_arr.push(tmp);
    }
    return flipped_arr.join("").toString();
}

function derive_smk_key(shared_key) {

    var key = CryptoJS.enc.Hex.parse("00000000000000000000000000000000");
    var message = CryptoJS.enc.Hex.parse(shared_key);
    var key_derive_key = CryptoJS.CMAC(key, message);

    var derived_buffer = new Uint8Array(7);
    derived_buffer.set([1], 0);
    var lable = convertStringToArrayBufferView("SMK");
    derived_buffer.set(lable, 1);

    var key_length = new Uint16Array(1);
    key_length.set([128], 0);
    var key_length_Uint8 = new Uint8Array(key_length.buffer);

    derived_buffer.set(key_length_Uint8, 5);

    var second_key = CryptoJS.enc.Hex.parse(key_derive_key.toString());
    var second_msg = CryptoJS.enc.Hex.parse(byteToHexString(derived_buffer));

    var smk = CryptoJS.CMAC(second_key, second_msg);
    return smk.toString();
}

function derive_mk_key(shared_key) {

    var key = CryptoJS.enc.Hex.parse("00000000000000000000000000000000");
    var message = CryptoJS.enc.Hex.parse(shared_key);
    var key_derive_key = CryptoJS.CMAC(key, message);

    var derived_buffer = new Uint8Array(6);
    derived_buffer.set([1], 0);
    var lable = convertStringToArrayBufferView("MK");
    derived_buffer.set(lable, 1);

    var key_length = new Uint16Array(1);
    key_length.set([128], 0);
    var key_length_Uint8 = new Uint8Array(key_length.buffer);

    derived_buffer.set(key_length_Uint8, 4);

    var second_key = CryptoJS.enc.Hex.parse(key_derive_key.toString());
    var second_msg = CryptoJS.enc.Hex.parse(byteToHexString(derived_buffer));

    var mk = CryptoJS.CMAC(second_key, second_msg);
    return mk.toString();
}

function derive_sk_key(shared_key) {

    var key = CryptoJS.enc.Hex.parse("00000000000000000000000000000000");
    var message = CryptoJS.enc.Hex.parse(shared_key);
    var key_derive_key = CryptoJS.CMAC(key, message);

    var derived_buffer = new Uint8Array(6);
    derived_buffer.set([1], 0);
    var lable = convertStringToArrayBufferView("SK");
    derived_buffer.set(lable, 1);

    var key_length = new Uint16Array(1);
    key_length.set([128], 0);
    var key_length_Uint8 = new Uint8Array(key_length.buffer);

    derived_buffer.set(key_length_Uint8, 4);

    var second_key = CryptoJS.enc.Hex.parse(key_derive_key.toString());
    var second_msg = CryptoJS.enc.Hex.parse(byteToHexString(derived_buffer));

    var sk = CryptoJS.CMAC(second_key, second_msg);
    return sk.toString();
}

function derive_vk_key(shared_key) {

    var key = CryptoJS.enc.Hex.parse("00000000000000000000000000000000");
    var message = CryptoJS.enc.Hex.parse(shared_key);
    var key_derive_key = CryptoJS.CMAC(key, message);


    var derived_buffer = new Uint8Array(6);
    derived_buffer.set([1], 0);
    var lable = convertStringToArrayBufferView("VK");

    derived_buffer.set(lable, 1);

    var key_length = new Uint16Array(1);
    key_length.set([128], 0);
    var key_length_Uint8 = new Uint8Array(key_length.buffer);

    derived_buffer.set(key_length_Uint8, 4);


    var second_key = CryptoJS.enc.Hex.parse(key_derive_key.toString());
    var second_msg = CryptoJS.enc.Hex.parse(byteToHexString(derived_buffer));

    var vk = CryptoJS.CMAC(second_key, second_msg);
    return vk.toString();
}

// utilitis functions for web sgx attestation




// received from msg1
var C_RECEIVED_ga_x;
var C_RECEIVED_ga_y;
var C_RECEIVED_GID;

// generated key pair
var C_private_key_object;
var C_public_key_object;
// shared key generated by ga_x, C_private_key_object
var dh_shared_key; // bits

var C_smk_key; // padding 0
var C_mk_key; // padding 2
var C_sk_key; // padding 1
var C_vk_key; // padding 3

var ga; // received from msg1
var gb; // generated by client
var ga_little;
var gb_little;




function receiveMSG1andProcess(text) {
    C_RECEIVED_ga_x = text['ga_x'];
    C_RECEIVED_ga_y = text['ga_y'];
    C_RECEIVED_GID = text['GID'];
    ga = new Uint8Array(64);
    var ga_x = hexStringToByte(C_RECEIVED_ga_x);
    var ga_y = hexStringToByte(C_RECEIVED_ga_y);
    ga.set(ga_x, 0);
    ga.set(ga_y, ga_x.byteLength);

    console.log("ga big-endiness is")
    console.log(ga);

    ga_little = new Uint8Array(64);
    ga_little.set(hexStringToByte(changeEndian(C_RECEIVED_ga_x)), 0);
    ga_little.set(hexStringToByte(changeEndian(C_RECEIVED_ga_y)), hexStringToByte(C_RECEIVED_ga_x).byteLength);

    console.log("ga little-endienss is");
    console.log(ga_little);

}

function deriveKeys(C_privateKey, C_privateKey_x, C_privateKey_y, client_ID) {
    window.crypto.subtle.generateKey({
            name: "ECDH",
            namedCurve: "P-256",
        }, true, ["deriveKey", "deriveBits"])
        .then(function(key) {
            C_private_key_object = key.privateKey;
            C_public_key_object = key.publicKey;

            window.crypto.subtle.exportKey("jwk", C_public_key_object) //base64url encoding
                .then(function(key) {
                    //returns the exported key data

                    var plainKey = "<br> x: " + Base64URL2HEX(key.x) + "<br>" + "y: " + Base64URL2HEX(key.y);
                    gb = new Uint8Array(64);
                    var tmp_public_key_x_exported = hexStringToByte(Base64URL2HEX(key.x));
                    var tmp_public_key_y_exported = hexStringToByte(Base64URL2HEX(key.y));

                    gb.set(tmp_public_key_x_exported, 0);
                    gb.set(tmp_public_key_y_exported, tmp_public_key_x_exported.byteLength);

                    console.log("gb big-endiness is");
                    console.log(gb);

                    // gb_little
                    gb_little = new Uint8Array(64);
                    var gb_little_x_exported = hexStringToByte(changeEndian(Base64URL2HEX(key.x)));
                    var gb_little_y_exported = hexStringToByte(changeEndian(Base64URL2HEX(key.y)));
                    gb_little.set(gb_little_x_exported, 0);
                    gb_little.set(gb_little_y_exported, gb_little_x_exported.byteLength);

                    console.log("gb little-endienss is");
                    console.log(gb_little);

                    $('#C_ECCDH_public_key').html(plainKey);

                }).catch = function(e) {
                    console.log("export public key error");
                    console.log(e.message);
                }

            window.crypto.subtle.exportKey("jwk", C_private_key_object) //base64url encoding
                .then(function(key) {

                    $('#C_ECCDH_private_key').html(Base64URL2HEX(key.d));
                    console.log(key);

                }).catch = function(e) {
                    console.log("export public key error");
                    console.log(e.message);
                }
        }).catch = function(e) {
            console.log("generate key error");
            console.log(e.message);
        }

    window.crypto.subtle.importKey(
            "jwk", //can be "jwk" (public or private), "raw" (public only), "spki" (public only), or "pkcs8" (private only)
            { //this is an example jwk key, other key types are Uint8Array objects
                kty: "EC",
                crv: "P-256",
                x: HEX2Base64URL(C_RECEIVED_ga_x),
                y: HEX2Base64URL(C_RECEIVED_ga_y),
                // d: "250dDOHq0N-P7fevM9XBfQ9fpICqDgnYk2vX0w8Ci-c",
                ext: true,
            }, { //these are the algorithm options
                name: "ECDH",
                namedCurve: "P-256", //can be "P-256", "P-384", or "P-521"
            },
            false, //whether the key is extractable (i.e. can be used in exportKey)
            [] //"deriveKey" and/or "deriveBits" for private keys only (just put an empty list if importing a public key)
        )
        .then(function(publicKey) {
            //returns a privateKey (or publicKey if you are importing a public key)
            console.log("improted public key based on big-endiness ga");
            console.log(publicKey);

            //derived shared key using client itself private key (just generated above) and Server's public key g_a
            // A_comput_shared_dhkey(A_private_key_object, publicKey);
            window.crypto.subtle.deriveBits({
                        name: "ECDH",
                        namedCurve: "P-256", //can be "P-256", "P-384", or "P-521"
                        public: publicKey, //an ECDH public key from generateKey or importKey
                    },
                    C_private_key_object, //your ECDH private key from generateKey or importKey
                    256)
                .then(function(bits) { // it's still the big-endiness format

                    var shared_key_big_endiness = new Uint8Array(bits);
                    console.log("derived shared key with big-endiness is");
                    console.log(shared_key_big_endiness);
                    dh_shared_key = unitArrayChangeEndian(shared_key_big_endiness); // change to little-endienss
                    // dh_shared_key = new Uint8Array(bits);
                    console.log("derived shared key with little-endienss is")
                    console.log(dh_shared_key);

                    $('#C_ECCDH_shared_key').html(byteToHexString(dh_shared_key));

                    // smk is only needed for msg2 generation

                    C_smk_key = derive_smk_key(byteToHexString(dh_shared_key));

                    $('#C_ECCDH_derived_smk_key').html(C_smk_key);

                    C_mk_key = derive_mk_key(byteToHexString(dh_shared_key));
                    $('#C_ECCDH_derived_mk_key').html(C_mk_key);

                    C_sk_key = derive_sk_key(byteToHexString(dh_shared_key));
                    $('#C_ECCDH_derived_sk_key').html(C_sk_key);

                    C_vk_key = derive_vk_key(byteToHexString(dh_shared_key));
                    $('#C_ECCDH_derived_vk_key').html(C_vk_key);

                    // create gb_ga it's big-endiness format
                    var gb_ga = new Uint8Array(128);
                    gb_ga.set(gb, 0);
                    gb_ga.set(ga, gb.byteLength);

                    console.log("gb_ga with big-endiness");
                    console.log(gb_ga);

                    // get little-endiness format
                    var gb_ga_little_endian = new Uint8Array(128);
                    gb_ga_little_endian.set(gb_little, 0);
                    gb_ga_little_endian.set(ga_little, gb_little.byteLength);
                    console.log("gb_ga with little-endiness");
                    console.log(gb_ga_little_endian);


                    // console.log(gb_ga);

                    //sign gb_ga by client privateKey
                    window.crypto.subtle.importKey(
                            "jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
                            { //this is an example jwk key, other key types are Uint8Array objects
                                kty: "EC",
                                crv: "P-256",
                                x: HEX2Base64URL(changeEndian(C_privateKey_x)),
                                y: HEX2Base64URL(changeEndian(C_privateKey_y)),
                                d: HEX2Base64URL(C_privateKey),
                                ext: true,
                            }, { //these are the algorithm options
                                name: "ECDSA",
                                namedCurve: "P-256", //can be "P-256", "P-384", or "P-521"
                            },
                            false, //whether the key is extractable (i.e. can be used in exportKey)
                            ["sign"] //"verify" for public key import, "sign" for private key imports
                        )
                        .then(function(privateKey) {
                            //returns a publicKey (or privateKey if you are importing a private key)
                            console.log(privateKey);
                            // sgin gb_ga with improted privateKey
                            window.crypto.subtle.sign({
                                        name: "ECDSA",
                                        hash: {
                                            name: "SHA-256"
                                        }, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
                                    },
                                    privateKey, //from generateKey or importKey above
                                    // gb_ga //ArrayBuffer of data you want to sign 
                                    gb_ga_little_endian
                                )
                                .then(function(signature) { // this signature should also big-endiness 
                                    //returns an ArrayBuffer containing the signature
                                    console.log("signature");
                                    var msg2_sign_gb_ga = new Uint8Array(signature);
                                    console.log(msg2_sign_gb_ga);

                                    var msg2_sign_gb_ga_x = new Uint8Array(32);
                                    msg2_sign_gb_ga_x.set(msg2_sign_gb_ga.subarray(0, 32), 0);
                                    var msg2_sign_gb_ga_y = new Uint8Array(32);
                                    msg2_sign_gb_ga_y.set(msg2_sign_gb_ga.subarray(32, 64), 0);

                                    console.log("signature x");
                                    console.log(msg2_sign_gb_ga_x);
                                    console.log("signature y");
                                    console.log(msg2_sign_gb_ga_y);

                                    var msg2_sign_gb_ga_little_endian = new Uint8Array(64);
                                    msg2_sign_gb_ga_little_endian.set(unitArrayChangeEndian(msg2_sign_gb_ga_x), 0);
                                    msg2_sign_gb_ga_little_endian.set(unitArrayChangeEndian(msg2_sign_gb_ga_y), msg2_sign_gb_ga_x.byteLength);

                                    retreiveRL(C_RECEIVED_GID);

                                    var SPID = "2A57C3E6573D7EB2D56DE21CFB6C0132";
                                    generatAndSendMSG2(msg2_sign_gb_ga_little_endian, SPID, client_ID);
                                })
                                .catch(function(err) {
                                    console.log("sign gb_ga error");
                                    console.error(err);
                                });

                        })
                        .catch(function(err) {
                            console.log("import private key error");
                            console.error(err);
                        });



                }).catch = function(e) {
                    console.log("derived shared key error");
                    console.log(e.message);
                }
        })
        .catch(function(e) {
            console.log("import public key error")
            console.error(e);
        });
}

function retreiveRL(C_RECEIVED_GID) {
    // first get sig_rl from IAS based on GID;
    var sig_rl_size = 0;
    var sig_rl = "";
    var sig_rl_request_data = {
        'GID': C_RECEIVED_GID
    };

    $.ajax({
        type: "POST",
        url: "iasConn.php",
        data: sig_rl_request_data,
        dataType: "JSON",
        success: function(response) {

            if (response['result']) {

                console.log("retrieving sig_rl success based on GID");
                console.log("sig_rl_size is ");
                sig_rl_size = response['sig_rl_size'];
                console.log(sig_rl_size);

                if (sig_rl_size) {
                    sig_rl = $response['sig_rl'];
                    console.log("sig_rl is exist, and it's ");
                    console.log(sig_rl);
                }

            }

        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }

    }); // get sig_rl from IAS based on GID
}

function generatAndSendMSG2(msg2_sign_gb_ga_little_endian, SPID, client_ID) {

    // generate msg2_header: lengthis 8 bytes {type, status, size, align, body[]}
    var msg2_head = new Uint8Array(8);

    var msg2_head_type = new Uint8Array(1);
    msg2_head_type.set([1], 0);
    msg2_head.set(msg2_head_type, 0) // add type Uint8Array(1) to msg2_head 

    var msg2_head_status = new Uint8Array(2);
    msg2_head_status.set([0, 0], 0);
    msg2_head.set(msg2_head_status, msg2_head_type.byteLength); // add status Uint8Array(2) to msg2_head 

    var msg2_head_size = new Uint32Array(1);
    msg2_head_size.set([168], 0);
    var msg2_head_size_Uint8 = new Uint8Array(msg2_head_size.buffer);

    msg2_head.set(msg2_head_size_Uint8, msg2_head_type.byteLength + msg2_head_status.byteLength);

    var msg2_head_align = new Uint8Array(1);
    msg2_head.set(msg2_head_align, msg2_head_type.byteLength + msg2_head_status.byteLength + msg2_head_size_Uint8.byteLength);

    console.log("msg2_head");
    console.log(msg2_head);
    // generate msg2: length is 168 bytes {gb, spid, quote_type, kdf_id, sign_gb_ga, mac, sig_rl_size}
    var msg2 = new Uint8Array(168);
    msg2.set(gb_little, 0) // add gb Uint8Array(64) to msg2 gb is now little-endiness
    var msg2_spid = new Uint8Array(16);
    // msg2_spid.set(convertStringToArrayBufferView("Service X"), 0);
    msg2_spid.set(hexStringToByte(SPID), 0);
    msg2.set(msg2_spid, gb.byteLength); // add spid Uint8Array(16) to msg2

    var msg2_quote_type = new Uint16Array(1) // 1: linkable, 0 unlinkable
    msg2_quote_type.set([1], 0);
    var msg2_quote_type_Uint8 = new Uint8Array(msg2_quote_type.buffer);
    msg2.set(msg2_quote_type_Uint8, gb.byteLength + msg2_spid.byteLength); // add quote_type Uint8Array(2) to msg2

    var msg2_kdf_id = new Uint16Array(1);
    msg2_kdf_id.set([1], 0);
    var msg2_kdf_id_Uint8 = new Uint8Array(msg2_kdf_id.buffer);
    msg2.set(msg2_kdf_id_Uint8, gb.byteLength + msg2_spid.byteLength + msg2_quote_type_Uint8.byteLength); // add kdf_id Uint8Array(2) to msg2 

    msg2.set(msg2_sign_gb_ga_little_endian, gb.byteLength + msg2_spid.byteLength + msg2_quote_type_Uint8.byteLength + msg2_kdf_id_Uint8.byteLength); // add msg2_sign_gb_ga or msg2_sign_gb_ga_little_endian

    // Generate the CMACsmk for gb||SPID||TYPE||kdf_id||Sigsp(gb,ga)
    var msg2_to_be_maced = new Uint8Array(148);
    msg2_to_be_maced.set(msg2.subarray(0, 148), 0);
    console.log("msg2 need to be maced part is");
    console.log(msg2_to_be_maced);

    var key = CryptoJS.enc.Hex.parse(C_smk_key);
    var message = CryptoJS.enc.Hex.parse(byteToHexString(msg2_to_be_maced));

    var mac = hexStringToByte(CryptoJS.CMAC(key, message).toString());

    // var mac = hexStringToByte(CryptoJS.CMAC(C_smk_key, byteToHexString(msg2_to_be_maced)).toString());
    console.log("generated mac:");
    // console.log(mac);
    console.log(mac);

    msg2.set(mac, gb.byteLength + msg2_spid.byteLength + msg2_quote_type_Uint8.byteLength + msg2_kdf_id_Uint8.byteLength + msg2_sign_gb_ga_little_endian.byteLength);

    var msg2_sig_rl_size = new Uint32Array(1);
    var msg2_sig_rl_size_Uint8 = new Uint8Array(msg2_sig_rl_size.buffer);

    msg2.set(msg2_sig_rl_size_Uint8, gb.byteLength + msg2_spid.byteLength + msg2_quote_type_Uint8.byteLength + msg2_kdf_id_Uint8.byteLength + msg2_sign_gb_ga_little_endian.byteLength + mac.byteLength);

    console.log("msg2");
    console.log(msg2);

    // concate msg2_head and msg2
    var msg2_full = new Uint8Array(176) // 8+168
    msg2_full.set(msg2_head, 0);
    msg2_full.set(msg2, msg2_head.byteLength);

    console.log("msg2_full");
    console.log(msg2_full);
    var hexstring_msg2 = byteToHexString(msg2_full);
    console.log(hexstring_msg2);

    var msg2_request_data = {
        'client_id': client_ID,
        'length': 176,
        'msg2': hexstring_msg2,

    };

    // send msg2 
    $.ajax({
        type: "POST",
        url: "https://vpn.centromereinc.com/send_MSG2.php",
        data: msg2_request_data,
        dataType: "JSON",
        success: function(response) {

            console.log("msg2 send out, receiving msg3");
            // receiving msg3

            var msg3_request_data = {
                'client_id': client_ID,
            };
            receiveMSG3andProcess(msg3_request_data);

        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }

    }); // send msg2 to server
}

function receiveMSG3andProcess(msg3_request_data) {
    $.ajax({
        type: "POST",
        url: "https://vpn.centromereinc.com/recv_MSG3.php",
        data: msg3_request_data,
        dataType: "JSON",
        success: function(response) {

            // msg3 {mac(16), msg2 message}
            console.log(response);
            var msg3_length = response['length'];
            console.log(msg3_length);

            var msg3 = response['MSG3'];
            console.log("full msg3");
            console.log(msg3);
            var msg3_mac = response['msg3_mac'];
            console.log("msg3 mac");
            console.log(msg3_mac);
            var msg3_message = response['msg3_message'];
            console.log("msg3 message:");
            console.log(msg3_message);

            var msg3_ga = msg3_message.substring(0, 128);
            console.log("msg3->ga");
            console.log(msg3_ga);

            // compare g_a in message 3 with local g_a btw, received ga is little-endian, our local ga is big-endian

            // console.log(byteToHexString(ga_little));

            if (msg3_ga.toUpperCase().localeCompare(byteToHexString(ga_little)) != 0) {
                console.log("error ga is not match");
            }

            var verify_mac_key = CryptoJS.enc.Hex.parse(C_smk_key);
            var verify_message = CryptoJS.enc.Hex.parse(msg3_message);

            var tmp_mac = CryptoJS.CMAC(verify_mac_key, verify_message).toString();

            // compare mac in message 3 with generated mac using SMK key

            console.log("generated mac is");
            console.log(tmp_mac);

            if (msg3_mac.localeCompare(tmp_mac) != 0) {
                console.log("error mac is not match");
            }

            //  extract msg3->ps_sec_prop (256 bytes) to local
            var ps_sec_prop = msg3_message.substring(128, 640);

            console.log("ps_sec_prop");
            console.log(ps_sec_prop);

            // extract quote from msg3 to local
            var p_quote = msg3_message.substring(640, 2872);

            console.log("quote is");
            console.log(p_quote);

            var p_quote_base64 = hexToBase64(p_quote);

            // need to verify the quote with IAS

            var quote_verify_request_data = {
                'quote': p_quote_base64
            };

            $.ajax({
                type: "POST",
                url: "iasQuoteReport.php",
                data: quote_verify_request_data,
                dataType: "JSON",
                success: function(response) {

                    console.log("verify quote with IAS");
                    console.log("qutoe is");
                    console.log(response['quote']);
                    console.log("response is");
                    console.log(response);

                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(textStatus, errorThrown);
                }

            }); // verify the quote with IAS



            var report_body = p_quote.substring(96, 864);


            // verify the report_data in the Quote, the first 32 bytes of report_data are sha256 hash of (ga|gb|vk)
            // the second 32 bytes of report_data are set to zero

            var ga_gb_vk = new Uint8Array(144); // 64+64+16
            ga_gb_vk.set(ga_little, 0);
            ga_gb_vk.set(gb_little, ga_little.byteLength);
            ga_gb_vk.set(hexStringToByte(C_vk_key), ga_little.byteLength + gb_little.byteLength);

            var report_data = report_body.substring(640, 768);

            window.crypto.subtle.digest({
                        name: "SHA-256",
                    },
                    ga_gb_vk //The data you want to hash as an ArrayBuffer
                )
                .then(function(hash) {
                    //returns the hash as an ArrayBuffer
                    var digest_data = new Uint8Array(hash);
                    console.log("generated sha256hash is")
                    var sha256hash = byteToHexString(digest_data);
                    console.log(sha256hash);

                    console.log("first_32_byte is");
                    var tmp_first_32 = report_data.substring(0, 64);
                    console.log(tmp_first_32.toUpperCase());

                    if (tmp_first_32.toUpperCase().localeCompare(sha256hash) != 0) {
                        console.log("report_data the first 32 bytes dose not match");
                    } else {
                        // TODO: verify enclave policy, verify quote with IAS
                        // print attestation report:

                        // TODO: verify the enclave policy report

                        // simulate function ias_verify_attestation_evidence to generate attestation report {input p_quote, output, p_attestation_report}

                        // 1.Decrypt the Quote signature and verify
                        var p_attestation_report_id = new Uint32Array(); // 0x12345678
                        // p_attestation_report_id.of(0x12345678);
                        p_attestation_report_id_Uint8 = new Uint8Array(p_attestation_report_id.buffer);

                        var p_attestation_report_status = new Uint32Array(1);
                        p_attestation_report_status.set([0], 0);
                        var p_attestation_report_status_Uint8 = new Uint8Array(p_attestation_report_status.buffer);

                        var p_attestation_report_revocation_reason = new Uint32Array(1);
                        p_attestation_report_revocation_reason.set([0], 0);
                        var p_attestation_report_revocation_reason_Uint8 = new Uint8Array(p_attestation_report_revocation_reason.buffer);

                        var p_attestation_report_info_blob_epid_group_status = new Uint32Array(1);
                        p_attestation_report_info_blob_epid_group_status.set([0], 0);
                        p_attestation_report_info_blob_epid_group_status_Uint8 = new Uint8Array(p_attestation_report_info_blob_epid_group_status.buffer);

                        var p_attestation_report_info_blob_tcb_evaluation_status = new Uint32Array(1);
                        p_attestation_report_info_blob_tcb_evaluation_status.set([0], 0);
                        p_attestation_report_info_blob_tcb_evaluation_status_Uint8 = new Uint8Array(p_attestation_report_info_blob_tcb_evaluation_status.buffer);


                        var p_attestation_report_info_blob_pse_evaluation_status = new Uint32Array(1);
                        p_attestation_report_info_blob_pse_evaluation_status.set([0], 0);
                        p_attestation_report_info_blob_pse_evaluation_status_Uint8 = new Uint8Array(p_attestation_report_info_blob_pse_evaluation_status.buffer);

                        var p_attestation_report_info_blob_equivalent_tcb_psvn = new Uint8Array(18);
                        p_attestation_report_info_blob_equivalent_tcb_psvn.set([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 0);

                        var p_attestation_report_info_blob_pse_isvsvn = new Uint8Array(2);
                        p_attestation_report_info_blob_pse_isvsvn.set([0, 0], 0);

                        var p_attestation_report_info_blob_psda_svn = new Uint8Array(4);
                        p_attestation_report_info_blob_psda_svn.set([0, 0, 0, 0], 0);

                        var p_attestation_report_info_blob_rekey_gid = new Uint8Array(4);
                        p_attestation_report_info_blob_rekey_gid.set([0, 0, 0, 0], 0);

                        // signing the attestation_report using private key

                        var p_attestation_report_pse_status = new Uint32Array(1);
                        p_attestation_report_pse_status.set([0], 0);

                        var p_attestation_report_policy_report_size = new Uint32Array(1);
                        p_attestation_report_policy_report_size.set([0], 0);


                    }

                })
                .catch(function(err) {
                    console.error(err);
                });

            sendMSG4withFile(fileContent, C_sk_key);

        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }


    }); // receiving msg3 from server
}

function sendMSG4withFile(fileContent, C_sk_key, client_ID) {
    // send msg4 to server

    // assemble msg4 
    // generate msg4_header: lengthis 8 bytes {type, status, size, align, body[]}
    var msg4_head = new Uint8Array(8);

    var msg4_head_type = new Uint8Array(1);
    msg4_head_type.set([3], 0);
    msg4_head.set(msg4_head_type, 0) // add type Uint8Array(1) to msg2_head 

    var msg4_head_status = new Uint8Array(2);
    msg4_head_status.set([0, 0], 0);
    msg4_head.set(msg4_head_status, msg4_head_type.byteLength); // add status Uint8Array(2) to msg2_head 

    var msg4_head_size = new Uint32Array(1); // 145head + g_secret 8
    msg4_head_size.set([1001], 0);
    var msg4_head_size_Uint8 = new Uint8Array(msg4_head_size.buffer);

    msg4_head.set(msg4_head_size_Uint8, msg4_head_type.byteLength + msg4_head_status.byteLength);

    var msg4_head_align = new Uint8Array(1);
    msg4_head.set(msg4_head_align, msg4_head_type.byteLength + msg4_head_status.byteLength + msg4_head_size_Uint8.byteLength);

    console.log("msg4_head");

    // generate msg4_body: length is 145 + 8(g_secret:8) bytes {platform_info_blob(97), mac(16), secret(32 including a mac_tag:16) + 8}

    var msg4_body_platform_info = new Uint8Array(97);

    // generat mac based on the mk key
    var msg4_body_mac = new Uint8Array(16);

    var key = CryptoJS.enc.Hex.parse(C_mk_key);
    var message = CryptoJS.enc.Hex.parse(byteToHexString(msg4_body_platform_info));

    var mac = hexStringToByte(CryptoJS.CMAC(key, message).toString());

    msg4_body_mac.set(mac, 0);



    var msg4_body_secret = new Uint8Array(32);

    var msg4_body_secret_payload_size = new Uint32Array(1);
    msg4_body_secret_payload_size.set([856], 0);
    var msg4_body_secret_payload_size_Uint8 = new Uint8Array(msg4_body_secret_payload_size.buffer);
    console.log("size of secret is 856");
    console.log(msg4_body_secret_payload_size_Uint8)

    msg4_body_secret.set(msg4_body_secret_payload_size_Uint8, 0);

    console.log("seccret part is");
    console.log(msg4_body_secret);

    var msg4_body_sent_out_secrets = new Uint8Array(856);
    // msg4_body_g_secrets.set([0,1,2,3,4,5,6,7],0);

    var secret_plain_tex = new Uint8Array(8);
    secret_plain_tex.set([0, 1, 2, 3, 4, 5, 6, 7], 0);

    console.log("-------------our local loaded file is-------------");
    console.log(fileContent);

    // encrypt g_secrets using sk_key with algorithm aes-gcm

    window.crypto.subtle.importKey(
            "jwk", //can be "jwk" or "raw"
            { //this is an example jwk key, "raw" would be an ArrayBuffer
                kty: "oct",
                k: HEX2Base64URL(C_sk_key),
                alg: "A128GCM",
                ext: true,
            }, { //this is the algorithm options
                name: "AES-GCM",
            },
            false, //whether the key is extractable (i.e. can be used in exportKey)
            ["encrypt", "decrypt"] //can "encrypt", "decrypt", "wrapKey", or "unwrapKey"
        )
        .then(function(sk_key) {
            //returns the symmetric key
            console.log("imported sk_key for AES-GCM128");
            console.log(sk_key);
            var aes_gcm_iv = new Uint8Array(12);
            aes_gcm_iv.set([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
            console.log("aes_gcm_iv type is");
            console.log(typeof(aes_gcm_iv));

            window.crypto.subtle.encrypt({
                        name: "AES-GCM",
                        iv: aes_gcm_iv,
                    },
                    sk_key, //from generateKey or importKey above
                    fileContent
                    // secret_plain_tex //ArrayBuffer of data you want to encrypt
                )
                .then(function(encrypted) {
                    //returns an ArrayBuffer containing the encrypted data

                    var tmp_aes_secrets = new Uint8Array(encrypted);
                    console.log("output of AES-GCM128");
                    console.log(tmp_aes_secrets);
                    msg4_body_sent_out_secrets.set(tmp_aes_secrets.subarray(0, 856), 0);
                    console.log("encrypted g_secret");
                    console.log(msg4_body_sent_out_secrets);

                    var msg4_body_secret_payload_tag = new Uint8Array(16);
                    msg4_body_secret_payload_tag.set(tmp_aes_secrets.subarray(856, 872), 0);

                    console.log("payload_tag is");
                    console.log(msg4_body_secret_payload_tag);

                    // add payload_tag
                    msg4_body_secret.set(msg4_body_secret_payload_tag, 16);

                    console.log("msg4_body_secret");
                    console.log(msg4_body_secret);

                    // msg4_body 97+16+32+8 {platform_info_blob(97), mac(16), secret(32) + 8}
                    // new test 97 + 16 + 32 + 856 = 1001
                    var msg4_body = new Uint8Array(1001);
                    msg4_body.set(msg4_body_platform_info, 0);
                    msg4_body.set(msg4_body_mac, msg4_body_platform_info.byteLength);
                    msg4_body.set(msg4_body_secret, msg4_body_platform_info.byteLength + msg4_body_mac.byteLength);
                    msg4_body.set(msg4_body_sent_out_secrets, msg4_body_platform_info.byteLength + msg4_body_mac.byteLength + msg4_body_secret.byteLength);

                    console.log("msg4_body");
                    console.log(msg4_body);

                    // concate msg4_head and msg4
                    var msg4_full = new Uint8Array(1009) // 8+1001
                    msg4_full.set(msg4_head, 0);
                    msg4_full.set(msg4_body, msg4_head.byteLength);

                    console.log("msg4_full");
                    console.log(msg4_full);
                    var hexstring_msg4 = byteToHexString(msg4_full);
                    console.log(hexstring_msg4);

                    // send msg4 to server
                    var msg4_request_data = {
                        'client_id': client_ID,
                        'length': 1009,
                        'msg4': hexstring_msg4,
                    };
                    $.ajax({
                        type: "POST",
                        url: "https://vpn.centromereinc.com/send_MSG4.php",
                        data: msg4_request_data,
                        dataType: "JSON",
                        success: function(response) {

                            console.log(response);
                            console.log(response['signal']);

                            aes_gcm_iv.set([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 0);

                            // -----------------------send sam file-----------------------
                            sendSamFile(sk_key, samfileContent, aes_gcm_iv, client_ID);
                            // -----------------------send sam file-----------------------

                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            console.log(textStatus, errorThrown);
                        }

                    }); // sending msg4 to server


                })
                .catch(function(err) {
                    console.log("encrypt fail")
                    console.error(err);
                });

        })
        .catch(function(err) {
            console.log("import sk_key error")
            console.error(err);
        });
}

function sendSamFile(sk_key, samfileContent, aes_gcm_iv, client_ID) {
    window.crypto.subtle.encrypt({
                name: "AES-GCM",
                iv: aes_gcm_iv,
            },
            sk_key,
            samfileContent
        )
        .then(function(encrypted) {

            var tmp_aes_secrets = new Uint8Array(encrypted);
            var sam_secret_file = new Uint8Array(samfileLength);
            console.log("output of AES-GCM128 of sam");
            console.log(tmp_aes_secrets);
            sam_secret_file.set(tmp_aes_secrets.subarray(0, samfileLength), 0);
            console.log("encrypted sam file");
            console.log(sam_secret_file);

            var sam_secret_tag = new Uint8Array(16);
            sam_secret_tag.set(tmp_aes_secrets.subarray(samfileLength, samfileLength + 16), 0);

            console.log("sam file payload_tag is");
            console.log(sam_secret_tag);

            // concate file + tag (16)
            let full_length = 16 + samfileLength;
            var sam_full = new Uint8Array(full_length) // 16+filelength

            sam_full.set(sam_secret_file, 0)
            sam_full.set(sam_secret_tag, sam_secret_file.byteLength);

            var hexstring_sam = byteToHexString(sam_full);
            // console.log(hexstring_sam);
            // send to server 
            var secret_reqeust_data = {
                'client_id': client_ID,
                'length': full_length,
                'sam': hexstring_sam,
            };
            $.ajax({
                type: "POST",
                url: "https://vpn.centromereinc.com/send_Sam.php",
                data: secret_reqeust_data,
                dataType: "JSON",
                success: function(response) {
                    console.log(response);

                    aes_gcm_iv.set([2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 0);

                    sendRefFile(sk_key, reffileContent, aes_gcm_iv, client_ID);

                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(textStatus, errorThrown);
                }

            });

        })
        .catch(function(err) {
            console.log("encrypt fail");
            console.error(err);
        });
}

function sendRefFile(sk_key, reffileContent, aes_gcm_iv, client_ID) {

    window.crypto.subtle.encrypt({
                name: "AES-GCM",
                iv: aes_gcm_iv,
            },
            sk_key,
            reffileContent
        )
        .then(function(encrypted) {

            var tmp_aes_secrets = new Uint8Array(encrypted);
            var ref_secret_file = new Uint8Array(reffileLength);
            console.log("output of AES-GCM128 of sam");
            console.log(tmp_aes_secrets);
            ref_secret_file.set(tmp_aes_secrets.subarray(0, reffileLength), 0);
            console.log("encrypted ref file");
            console.log(ref_secret_file);

            var ref_secret_tag = new Uint8Array(16);
            ref_secret_tag.set(tmp_aes_secrets.subarray(reffileLength, reffileLength + 16), 0);

            console.log("ref file payload_tag is");
            console.log(ref_secret_tag);

            // concate file + tag (16)
            let full_length = 16 + reffileLength;
            var ref_full = new Uint8Array(full_length) // 16+filelength

            ref_full.set(ref_secret_file, 0)
            ref_full.set(ref_secret_tag, ref_secret_file.byteLength);

            var hexstring_ref = byteToHexString(ref_full);
            // console.log(hexstring_ref);
            // send to server 
            var ref_secret_reqeust_data = {
                'client_id': client_ID,
                'length': full_length,
                'ref': hexstring_ref,
            };
            $.ajax({
                type: "POST",
                url: "https://vpn.centromereinc.com/send_Ref.php",
                data: ref_secret_reqeust_data,
                dataType: "JSON",
                success: function(response) {
                    console.log(response);

                    aes_gcm_iv.set([3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
                    //-----------------------send index file-----------------------
                    sendIndexFile(sk_key, refindexfileContent, aes_gcm_iv, client_ID);
                    //-----------------------send index file-----------------------

                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(textStatus, errorThrown);
                }

            });

        })
        .catch(function(err) {
            console.log("encrypt fail");
            console.error(err);
        });
}

function sendIndexFile(sk_key, refindexfileContent, aes_gcm_iv, client_ID) {

    window.crypto.subtle.encrypt({
                name: "AES-GCM",
                iv: aes_gcm_iv,
            },
            sk_key,
            refindexfileContent
        )
        .then(function(encrypted) {

            var tmp_aes_secrets = new Uint8Array(encrypted);
            var index_secret_file = new Uint8Array(refindexfileLength);
            console.log("output of AES-GCM128 of index file");
            console.log(tmp_aes_secrets);
            index_secret_file.set(tmp_aes_secrets.subarray(0, refindexfileLength), 0);
            console.log("encrypted index file");
            console.log(index_secret_file);

            var index_secret_tag = new Uint8Array(16);
            index_secret_tag.set(tmp_aes_secrets.subarray(refindexfileLength, refindexfileLength + 16), 0);

            console.log("index file payload_tag is");
            console.log(index_secret_tag);

            // concate file + tag (16)
            let full_length = 16 + refindexfileLength;
            var index_full = new Uint8Array(full_length) // 16+filelength

            index_full.set(index_secret_file, 0)
            index_full.set(index_secret_tag, index_secret_file.byteLength);

            var hexstring_index = byteToHexString(index_full);
            console.log(hexstring_index);
            // send to server 
            var index_secret_reqeust_data = {
                'client_id': client_ID,
                'length': full_length,
                'inx': hexstring_index,
            };
            $.ajax({
                type: "POST",
                url: "https://vpn.centromereinc.com/send_Index.php",
                data: index_secret_reqeust_data,
                dataType: "JSON",
                success: function(response) {
                    console.log(response);
                    console.log(response['sendoutis']);

                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(textStatus, errorThrown);
                }

            });

        })
        .catch(function(err) {
            console.log("encrypt fail");
            console.error(err);
        });
}
