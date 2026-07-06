import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiAlertCircle, FiCamera } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { attendanceService } from '../../services/attendanceService';

function ScanQR() {
  const params = useParams();
  const eventId = params.eventId;
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(function () {
    return function cleanup() {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(function () {});
      }
    };
  }, []);

  function startScanning() {
    setResult(null);
    setScanning(true);

    const html5QrCode = new Html5Qrcode('qr-reader');
    html5QrCodeRef.current = html5QrCode;

    html5QrCode
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        function (decodedText) {
          html5QrCode.stop().then(function () {
            setScanning(false);
            handleScanResult(decodedText);
          });
        },
        function () {}
      )
      .catch(function () {
        toast.error('Camera access failed. Please allow camera permissions.');
        setScanning(false);
      });
  }

  function stopScanning() {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      html5QrCodeRef.current.stop();
    }
    setScanning(false);
  }

  function handleScanResult(qrData) {
    setProcessing(true);
    attendanceService
      .scanTicket(qrData)
      .then(function (data) {
        setResult(data);
      })
      .catch(function (err) {
        const errData = err.response && err.response.data ? err.response.data : { result: 'invalid', message: 'Scan failed' };
        setResult(errData);
      })
      .finally(function () {
        setProcessing(false);
      });
  }

  const resultConfig = {
    valid: { icon: FiCheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Check-In Successful' },
    'already-used': { icon: FiAlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Already Checked-In' },
    invalid: { icon: FiXCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Invalid Ticket' },
    cancelled: { icon: FiXCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Ticket Cancelled' },
    unauthorized: { icon: FiXCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Not Authorized' },
  };

  const config = result ? resultConfig[result.result] || resultConfig.invalid : null;
  const ConfigIcon = config ? config.icon : null;

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      <Link to="/organizer/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 text-sm font-medium">
        <FiArrowLeft className="w-4 h-4" />
        Back to dashboard
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Scan QR Ticket</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Scan a ticket QR code to check in an attendee.</p>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <div id="qr-reader" ref={scannerRef} className="rounded-lg overflow-hidden mb-4"></div>

        {!scanning && !result && (
          <button onClick={startScanning} className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-lg transition">
            <FiCamera className="w-5 h-5" />
            Start Scanning
          </button>
        )}

        {scanning && (
          <button onClick={stopScanning} className="w-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium py-3 rounded-lg transition">
            Stop Scanning
          </button>
        )}

        {processing && (
          <div className="flex justify-center py-6">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {result && config && (
          <div className={config.bg + ' rounded-xl p-5 text-center'}>
            <ConfigIcon className={'w-12 h-12 ' + config.color + ' mx-auto mb-3'} />
            <p className={'font-semibold ' + config.color + ' mb-1'}>{config.label}</p>
            <p className="text-sm text-gray-600">{result.message}</p>
            {result.attendee && (
              <p className="text-sm text-gray-500 mt-2">
                {result.attendee.name} - {result.attendee.email}
              </p>
            )}
            <button
              onClick={function () {
                setResult(null);
                startScanning();
              }}
              className="mt-4 text-sm font-medium text-primary-600 hover:underline"
            >
              Scan another ticket
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScanQR;