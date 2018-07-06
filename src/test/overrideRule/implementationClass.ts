namespace override {
    
    export class ImplementationClass extends ExampleClass {


        /**
         * Public property should force override decorator for any implementations
         */
        @override public baseProperty = "Implementation";
        
        /**
         * This property will fail due to no decorator.
         */
        protected exampleProperty = "Implementation";


        /**
         * Public method should force override decorator for any implementations
         */
        @override public baseMethodOne() {
            /// noop
        }

        /**
         * Protected method should force override decorator for any implementations
         */
        @override protected baseMethodTwo() {
            /// noop
        }


        /**
         * Public method should force override decorator for any implementations
         */
        @override public exampleMethodOne() {
            /// noop
        }

        /**
         * Protected method should force override decorator for any implementations
         */
        @override protected exampleMethodTwo() {
            /// noop
        }        
        
        /**
         * Protected method should force override decorator for any implementations
         */
        protected exampleMethodThree() {
            /// This method will fail due to no decorator.
        }

        /**
         * Private method should not force override decorator for any implementations
         */
        private implementationClassMethodOne() {
            /// noop
        }
        
    }
    
}
