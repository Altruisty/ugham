
// Payment section and Google Sheet Integration



const scriptURL =
"https://script.google.com/macros/s/AKfycbySGVGfC6rsI1AMuOYiSFeHk8INiqQnj74Wc-NfT852HY1cNlBsqDZwdHoA7pohV7Ug/exec";


const RAZORPAY_KEY = "rzp_live_SZRkYdQMzFlJYX"; // replace with your key

let isProcessing = false;

document.getElementById("payBtn")
.addEventListener("click", async () => {

    if (isProcessing) return;

    isProcessing = true;

    const overlay =
        document.getElementById("successOverlay");

    const loader =
        document.getElementById("paymentLoader");

    const successCard =
        document.getElementById("successCard");

    const statusMessage =
        document.getElementById("statusMessage");

    try {

        const amountText =
            document.getElementById("totalAmount").innerText;

        const amount =
            parseInt(amountText.replace("₹", ""));

        if (!amount || amount <= 0) {

            alert("Please select category and team size");

            isProcessing = false;

            return;

        }

        // SHOW LOADER

        overlay.classList.remove("hidden");

        loader.classList.remove("hidden");

        successCard.classList.add("hidden");

        statusMessage.innerText =
            "Initializing Payment";

        // PREPARE FORM DATA

        const teamSize =
            parseInt(
                document.getElementById("teamSize").value
            );

        const members = [];

        for (let i = 2; i <= teamSize; i++) {

            members.push({

                name:
                    document.getElementById(
                        `memberName${i}`
                    )?.value.trim() || "None",

                email:
                    document.getElementById(
                        `memberEmail${i}`
                    )?.value.trim() || "None",

                phone:
                    document.getElementById(
                        `memberPhone${i}`
                    )?.value.trim() || "None",

                dept:
                    document.getElementById(
                        `memberDept${i}`
                    )?.value.trim() || "None"

            });

        }

        while (members.length < 4) {

            members.push({

                name: "None",
                email: "None",
                phone: "None",
                dept: "None"

            });

        }

        const formData = {

            teamName:
                document.getElementById("teamName").value,

            leaderName:
                document.getElementById("leaderName").value,

            phone:
                document.getElementById("phone").value,

            email:
                document.getElementById("email").value,

            college:
                document.getElementById("college").value,

            dept:
                document.getElementById("dept").value,

            yearOfStudy:
                document.getElementById("yearOfStudy").value,

            city:
                document.getElementById("city").value,

            teamSize: teamSize,

            category:
                document.querySelector(
                    'input[name="category"]:checked'
                ).value,

            projectTitle:
                document.getElementById("projectTitle").value,

            deckLink:
                document.getElementById("deckLink").value,

            demoLink:
                document.getElementById("demoLink").value,

            referralCode:
                document.getElementById("referralCode")?.value || "",

            eventDate:
                document.getElementById("eventDate").value,

            totalAmount: amount,

            members: members

        };

        statusMessage.innerText =
            "Opening Secure Payment";

        // RAZORPAY

        const options = {

            key: RAZORPAY_KEY,

            amount: amount * 100,

            currency: "INR",

            name: "Hackathon Registration",

            description:
                "Event Registration Fee",

            handler: async function (response) {

                try {

                    statusMessage.innerText =
                        "Verifying Payment";

                    // ATTACH PAYMENT DETAILS

                    formData.payment_id =
                        response.razorpay_payment_id;

                    formData.order_id =
                        response.razorpay_order_id;

                    formData.signature =
                        response.razorpay_signature;

                    statusMessage.innerText =
                        "Submitting Registration";

                    const res =
                        await fetch(
                            scriptURL,
                            {

                                method: "POST",

                                body:
                                    JSON.stringify(
                                        formData
                                    )

                            }
                        );

                    const result =
                        await res.json();

                    showSuccess(
                        amount,
                        result.registrationID
                    );

                }

                catch (error) {

                    showFailure(
                        "Submission failed"
                    );

                }

            },

            modal: {

                ondismiss: function () {

                    showFailure(
                        "Payment Cancelled"
                    );

                }

            },

            theme: {

                color: "#000000"

            }

        };

        const rzp =
            new Razorpay(options);

        rzp.on(
            "payment.failed",
            function (response) {

                showFailure(
                    response.error.description
                );

            }
        );

        rzp.open();

    }

    catch (error) {

        showFailure(
            "Something went wrong"
        );

    }

});

function showSuccess(amount, regID) {

    const loader =
        document.getElementById("paymentLoader");

    const successCard =
        document.getElementById("successCard");

    document
    .getElementById("successAmount")
    .innerText = "₹" + amount;

    document
    .getElementById("successID")
    .innerText = regID;

    loader.classList.add(
        "opacity-0",
        "scale-90"
    );

    setTimeout(() => {

        loader.classList.add("hidden");

        successCard.classList.remove(
            "hidden"
        );

        successCard.classList.add(
            "scale-100",
            "opacity-100"
        );

    }, 500);

    isProcessing = false;

}

function showFailure(message) {

    const loader =
        document.getElementById("paymentLoader");

    const successCard =
        document.getElementById("successCard");

    document
    .getElementById("statusMessage")
    .innerText = message;

    loader.classList.add("hidden");

    successCard.classList.remove(
        "hidden"
    );

    successCard.innerHTML = `

        <h2 class="text-3xl font-black text-red-600">
            Payment Failed
        </h2>

        <p class="mt-4 text-gray-600">
            ${message}
        </p>

        <button
            onclick="location.reload()"
            class="mt-8 bg-black text-white px-6 py-3 rounded-xl"
        >
            Try Again
        </button>

    `;

    isProcessing = false;

}